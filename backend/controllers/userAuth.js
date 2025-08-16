function authUser(req,res, next) {
    if (req.user === null) {
        res.status(403)
        return res.send('Please log in.')
    }

    next ()
}

function authRole(role) {
    return (req,res,next) => {
        if(req.user.role !== role) {
            res.status(401)
            return res.send('Admin access only')
        }

        next ()

    }


} 

module.exports = {
    authUser,
    authRole
}