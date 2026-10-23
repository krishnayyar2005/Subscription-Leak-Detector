// utils/normalizeCost.js
// -------------------------------------------------------
// WHAT IS NORMALIZATION?
// Normalization means converting different measurements into a single shared standard.
//
// In our app, users can have subscriptions billed on different cycles:
// some bill every week, some every month, and some once a year.
// If you spend $10/week on meal prep and $40/month on gym, which one costs more?
// Without converting them to a common unit, you cannot compare them, add them up,
// or detect which category has the highest spending leaks.
//
// By converting every subscription to a common monthly (or annual) amount,
// we can easily compare costs, sum total monthly spending, and spot leaks.
//
// WORKED EXAMPLE:
// A weekly subscription of $10:
// // Weekly 10 => 43.45 per month => 521.40 per year
// (10 * 4.345 = 43.45 monthly; 43.45 * 12 = 521.40 yearly)
// -------------------------------------------------------

// Constant: Average number of weeks in a single month
// this is 52.14 weeks in a year divided by 12 months, and it is the same value used in my Phase 1 frontend so the numbers match.
const WEEKS_PER_MONTH=4.345

// -------------------------------------------------------
// toMonthly
// Converts any given cost and billing cycle into its monthly equivalent.
// - Weekly: cost * 4.345
// - Monthly: cost
// - Yearly: cost / 12
//
// NOTE: We deliberately do NOT round inside toMonthly!
// Keeping full floating-point precision here ensures that when we sum
// multiple subscriptions together in future analysis features, rounding
// errors do not accumulate. Rounding only happens at the very end when displaying.
// -------------------------------------------------------
const toMonthly=(cost,cycle)=>{
    // Step 1: Validate and convert cost to a number
    const numeric_cost=Number(cost)
    if(!Number.isFinite(numeric_cost) || numeric_cost<=0){
        throw new Error("Cost must be a positive number")
    }

    // Step 2: Validate the billing cycle
    if(!cycle || typeof cycle!=="string"){
        throw new Error("Invalid billing cycle")
    }

    // Normalise cycle casing and whitespace: " Monthly " -> "monthly"
    const cleaned_cycle=cycle.trim().toLowerCase()

    // Step 3: Convert based on the cycle
    if(cleaned_cycle==="weekly"){
        return numeric_cost*WEEKS_PER_MONTH
    }
    else if(cleaned_cycle==="monthly"){
        return numeric_cost
    }
    else if(cleaned_cycle==="yearly"){
        return numeric_cost/12
    }
    else{
        throw new Error("Invalid billing cycle")
    }
}

// -------------------------------------------------------
// toAnnual
// Converts any given cost and billing cycle into its annual (yearly) equivalent.
// It multiplies the monthly equivalent by 12 months.
//
// NOTE: Just like toMonthly, we do NOT round inside toAnnual so intermediate
// calculations remain completely accurate. Rounding happens only when showing results.
// -------------------------------------------------------
const toAnnual=(cost,cycle)=>{
    return toMonthly(cost,cycle)*12
}

// -------------------------------------------------------
// round2
// Rounds to 2 decimal places and returns a Number.
// Example: round2(43.4500001) => 43.45
// Example: round2(0.1 + 0.2) => 0.3
// -------------------------------------------------------
const round2=(number)=>{
    return Math.round(Number(number)*100)/100
}

module.exports={toMonthly,toAnnual,round2}
