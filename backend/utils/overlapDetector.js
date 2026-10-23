// utils/overlapDetector.js
// -------------------------------------------------------
// WHAT IS OVERLAP DETECTION?
// When a user has multiple subscriptions in the SAME category
// (e.g. Spotify AND Apple Music in "Music"), we consider the cheaper
// ones as "leaks" - money wasted on duplicate services.
//
// HOW IT WORKS (worked example):
// Subscriptions:
//   Spotify       $9.99/month  (Music)
//   Apple Music   $99/year     (Music)
//   YouTube Music $4/week      (Music)
//
// Step 1: Group by category -> Music has 3 items
// Step 2: Convert each to monthly cost so we can compare apples to apples:
//   Spotify       = $9.99/month
//   Apple Music   = $99/12 = $8.25/month
//   YouTube Music = $4 * 4.345 = $17.38/month
// Step 3: Sort by monthly cost descending -> YouTube Music, Spotify, Apple Music
// Step 4: The PRICIEST one is "keep" (YouTube Music $17.38/month)
//         because the user clearly values that category enough to pay the most.
//         The rest are "redundant" - the leak.
// Step 5: monthlyLeak = 9.99 + 8.25 = 18.24
//         annualLeak  = 18.24 * 12 = 218.88
//
// WHY COMPARE IN MONTHLY UNITS?
// Monthly is the most intuitive timeframe for budgeting. Everyone thinks
// about bills in terms of "per month". Converting weekly and yearly costs
// to monthly lets us add them together and rank them fairly.
//
// WHY KEEP THE PRICIEST?
// The priciest subscription is likely the one the user uses most or values
// most - they chose to pay more for it. Suggesting they drop it would feel
// wrong. Instead we flag the cheaper duplicates as potential leaks.
// -------------------------------------------------------

const {toMonthly,toAnnual,round2}=require("./normalizeCost")

// -------------------------------------------------------
// detectOverlaps(subscriptions)
// Takes an array of subscription objects and returns overlap analysis.
// Each subscription must have: name, category, cost, cycle, _id (or id).
//
// IMPORTANT: We never modify the original input array or its items.
// We work on copies because the caller might still need the originals
// unchanged (e.g. the controller might send the same array to other
// utilities after this function returns).
// -------------------------------------------------------
const detectOverlaps=(subscriptions)=>{

    // Guard: input must be an array
    if(!Array.isArray(subscriptions)){
        throw new Error("Subscriptions must be an array")
    }

    // Handle empty array early - nothing to compare
    if(subscriptions.length===0){
        return {
            overlapCount:0,
            totalMonthlyLeak:0,
            totalAnnualLeak:0,
            overlaps:[]
        }
    }

    // -------------------------------------------------------
    // STEP 1: Group subscriptions by category
    // We normalize the category key with trim + lowercase so that
    // "Music", "music", and "Music " all land in the same group.
    // We also keep the FIRST item's trimmed original text as the
    // display name so the UI shows "Music" not "music".
    // -------------------------------------------------------
    const groups={}         // key: lowercase trimmed category, value: { displayName, items[] }

    subscriptions.forEach((sub)=>{
        // Normalize the category key for grouping
        const raw_category=sub.category || ""
        const key=raw_category.trim().toLowerCase()

        // Skip the "other" category entirely because unrelated services
        // (e.g. a VPN and a meal kit) are not real overlaps just because
        // neither fits a named category
        if(key==="other"){
            return
        }

        // Skip empty categories
        if(key===""){
            return
        }

        // Create the group if it does not exist yet
        if(!groups[key]){
            // Use the first item's trimmed text as the display name
            groups[key]={
                displayName:raw_category.trim(),
                items:[]
            }
        }

        // Push a COPY of the subscription data we need (never mutate the original)
        groups[key].items.push({
            id:String(sub._id||sub.id),
            name:sub.name,
            cycle:sub.cycle,
            cost:sub.cost
        })
    })

    // -------------------------------------------------------
    // STEP 2: Keep only groups with MORE THAN ONE subscription
    // A single subscription in a category is not an overlap - there
    // is nothing to compare it against.
    // -------------------------------------------------------
    const overlap_keys=Object.keys(groups).filter((key)=>{
        return groups[key].items.length>1
    })

    // No overlaps found at all
    if(overlap_keys.length===0){
        return {
            overlapCount:0,
            totalMonthlyLeak:0,
            totalAnnualLeak:0,
            overlaps:[]
        }
    }

    // -------------------------------------------------------
    // STEP 3: For each overlapping group, compute costs, sort,
    // pick keep vs redundant, and calculate the leak.
    // -------------------------------------------------------

    // We will accumulate unrounded totals across all categories
    // and only round once at the very end, so rounding errors
    // do not pile up across many categories.
    let raw_total_monthly_leak=0
    let raw_total_annual_leak=0

    const overlaps=[]

    overlap_keys.forEach((key)=>{
        const group=groups[key]

        // Calculate monthly and annual cost for each item
        const enriched_items=group.items.map((item)=>{
            const monthly=toMonthly(item.cost,item.cycle)
            const annual=toAnnual(item.cost,item.cycle)
            return {
                id:item.id,
                name:item.name,
                cycle:item.cycle,
                cost:item.cost,
                monthlyCost:monthly,   // unrounded for now
                annualCost:annual       // unrounded for now
            }
        })

        // Sort by monthly cost DESCENDING (priciest first)
        // If two items have the same monthly cost, sort by name alphabetically
        // so the result is deterministic - without the tie-break, Array.sort
        // is not guaranteed to be stable across JS engines, and tests would
        // sometimes pass and sometimes fail.
        enriched_items.sort((a,b)=>{
            if(b.monthlyCost!==a.monthlyCost){
                return b.monthlyCost-a.monthlyCost
            }
            return a.name.localeCompare(b.name)
        })

        // The first item is "keep" (priciest), the rest are "redundant"
        const keep_item=enriched_items[0]
        const redundant_items=enriched_items.slice(1)

        // monthlyLeak = sum of redundant items' UNROUNDED monthly costs
        // We do NOT round in the middle because rounding 3 small numbers
        // separately and then adding can give a different total than
        // adding them first and rounding once. Example:
        //   round2(1.005) + round2(1.005) = 1.01 + 1.01 = 2.02
        //   round2(1.005 + 1.005) = round2(2.01) = 2.01
        // The second approach is more accurate.
        let raw_monthly_leak=0
        redundant_items.forEach((item)=>{
            raw_monthly_leak=raw_monthly_leak+item.monthlyCost
        })
        const raw_annual_leak=raw_monthly_leak*12

        // Accumulate into the grand totals (still unrounded)
        raw_total_monthly_leak=raw_total_monthly_leak+raw_monthly_leak
        raw_total_annual_leak=raw_total_annual_leak+raw_annual_leak

        // Build the overlap object with rounded display values
        overlaps.push({
            category:group.displayName,
            count:enriched_items.length,
            keep:{
                id:keep_item.id,
                name:keep_item.name,
                cycle:keep_item.cycle,
                cost:keep_item.cost,
                monthlyCost:round2(keep_item.monthlyCost)
            },
            redundant:redundant_items.map((item)=>{
                return {
                    id:item.id,
                    name:item.name,
                    cycle:item.cycle,
                    cost:item.cost,
                    monthlyCost:round2(item.monthlyCost),
                    annualCost:round2(item.annualCost)
                }
            }),
            monthlyLeak:round2(raw_monthly_leak),
            annualLeak:round2(raw_annual_leak)
        })
    })

    // -------------------------------------------------------
    // STEP 4: Sort overlaps by annualLeak descending so the
    // biggest money leak appears first in the response.
    // -------------------------------------------------------
    overlaps.sort((a,b)=>{
        return b.annualLeak-a.annualLeak
    })

    // Round the grand totals only once at the very end
    return {
        overlapCount:overlaps.length,
        totalMonthlyLeak:round2(raw_total_monthly_leak),
        totalAnnualLeak:round2(raw_total_annual_leak),
        overlaps:overlaps
    }
}

module.exports={detectOverlaps}
