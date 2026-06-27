const ratelimit = require ("express-rate-limit");

const generalLimiter = ratelimit({

    windowMs:15*60*1000,
    max:100,
    standardHeaders:true,
    legacyHeaders:false,
    message:{
        success:false,
        message: "Too many requests. Please try again after 15 minutes.",
    }
}

);

const authLimiter= ratelimit({
    windowMs:15*60*1000,
    max:10,
    standardHeaders:true,
    legacyHeaders:false,
    message:{
        success:false,
        message: "Too many requests. Please try again after 15 minutes.",
    }
});


module.exports={generalLimiter,authLimiter};