const User = require("../models/User");


const getUserProfile = async (req, res, next) => {
    try{
        const user = await User.findById(req.user._id);

        if(!user){
            return res.status(404).json({message:"User not found"});

        }
        res.json(user)
    } catch(error){
        next(error);
    }
}
const updateUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.phone = req.body.phone || user.phone;

    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();
    res.json(updatedUser);
  } catch (error) {
    next(error);
  }
};

// @desc    Add a shipping address
// @route   POST /api/users/address
// @access  Private
const addAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    user.addresses.push(req.body);
    await user.save();
    res.status(201).json(user.addresses);
  } catch (error) {
    next(error);
  }
};

module.exports = { getUserProfile, updateUserProfile, addAddress };
