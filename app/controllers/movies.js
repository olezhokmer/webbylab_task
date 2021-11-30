exports.getHello = (req, res, next) => {
    return res.json("Hello " + req.user.name);
}