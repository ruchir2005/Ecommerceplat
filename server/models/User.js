const mongoose = require('mongoose');

const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
    {
        name: {
            type : String,
            required : [true, 'please provide a name'],
            trim: true
        },
        email: {
        type: String,
        required: [true, "Please provide an email"],
        unique: true,
        lowercase: true,
        trim: true,
    },
        password: {
        type: String,
        required: [true, "Please provide a password"],
        minlength: 6,
        select: false,
    },
        role: {
        type: String,
        enum: ["user", "admin"],
        default: "user",
    },
        phone: {
        type: String,
        default: "",
    },
        avatar: {
        type: String,
        default: "",
    },
        addresses: [
        {
        fullName: String,
        phone: String,
        addressLine1: String,
        addressLine2: String,
        city: String,
        state: String,
        pincode: String,
        isDefault: { type: Boolean, default: false },
      },
    ],

},
    {timestamps: true}
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  
});

// Compare entered password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);