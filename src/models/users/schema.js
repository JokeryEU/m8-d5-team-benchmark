import mongoose from "mongoose";
import bcrypt from "bcrypt";

const { Schema, model } = mongoose;

const UserSchema = new Schema(
  {
    email: {
      type: String,
      trim: true,
      required: true,
    },
    password: {
      type: String,
      // required: true,
      minlength: [8, "Minimum length must be 8 chars"],
      trim: true,
    },
    role: {
      type: String,
      required: true,
      enum: ["Host", "Guest"],
      default: "Guest",
      immutable: true,
    },
    refreshToken: { type: String },
    googleId: { type: String },
  },
  { timestamps: true }
);

UserSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(
      this.password,
      parseInt(process.env.SALT_ROUNDS)
    );
  }
  next();
});

UserSchema.statics.checkCredentials = async function (email, pw) {
  const user = await this.findOne({ email });
  if (user) {
    const isMatch = await bcrypt.compare(pw, user.password);
    if (isMatch) return user;
    else return null;
  } else return null;
};

UserSchema.methods.toJSON = function () {
  const user = this;

  const userObject = user.toObject();

  delete userObject.password;
  delete userObject.__v;
  delete userObject.refreshToken;
  //   delete userObject.role;
  return userObject;
};

export default model("User", UserSchema);
