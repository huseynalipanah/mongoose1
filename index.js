import express from "express";
import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";

const usersSchema = new Schema({
  Username: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  Email: {
    type: String,
    required: true,
    lowercase: true,
  },
  Password: {
    type: String,
    required: true,
  },
  Age: {
    type: Number,
    min: 0,
  },
  isMarried: {
    type: Boolean,
    default: false,
  },
});

usersSchema.pre("save", async function (next) {
  if (this.isModified("Password")) {
    this.Password = await bcrypt.hash(this.Password, 10);
  }
  next();
});

const validateUser = (user) => {
  const { Username, Email, Password, Age, isMarried } = user;

  if (!Username || typeof Username !== "string") {
    throw new Error("Username sahəsi boş ola bilməz və bir string olmalıdır.");
  }

  if (!Email || typeof Email !== "string" || !Email.includes("@")) {
    throw new Error("Email sahəsi düzgün bir email ünvanı olmalıdır.");
  }

  if (!Password || typeof Password !== "string" || Password.length < 6) {
    throw new Error(
      "Password sahəsi ən azı 6 simvol uzunluğunda bir string olmalıdır."
    );
  }

  if (Age === undefined || typeof Age !== "number" || Age < 0) {
    throw new Error("Age sahəsi 0'dan böyük bir rəqəm olmalıdır.");
  }

  if (isMarried === undefined || typeof isMarried !== "boolean") {
    throw new Error("isMarried sahəsi bir boolean dəyəri olmalıdır.");
  }
};

const usersModel = mongoose.model("users", usersSchema);

const app = express();
const port = 3000;

app.use(express.json());

app.get("/users", async (req, res) => {
  const users = await usersModel.find();
  res.send(users);
});

app.post("/users", async (req, res, next) => {
  const newUser = new usersModel(req.body);

  try {
    validateUser(req.body);
    await newUser.save();
    res.send("ugurla yarandi");
  } catch (err) {
    res.status(400).send(err.message);
  }
});

app.put("/users/:id", async (req, res) => {
  const { id } = req.params;
  const { Username, Email, Password, Age, isMarried } = req.body;
  const user = await usersModel.findByIdAndUpdate(id, {
    Username,
    Email,
    Password,
    Age,
    isMarried,
  });
  if (!user) {
    return res.status(404).send("Verilən İD-yə sahib istifadəçi yoxdur.");
  }
  res.send(`${id}-li istifadəçi dataları yeniləndi `);
});

app.delete("/users/:id", async (req, res) => {
  const { id } = req.params;
  const user = await usersModel.findByIdAndDelete(id);
  if (!user) {
    return res.status(404).send("Verilən İD-yə sahib istifadəçi yoxdur.");
  }
  res.send(` ${id}-li istifadəçi dataları silindi`);
});

mongoose
  .connect("mongodb+srv://huz3yn:huseyn04ru@hakunamatata.wsdwnh9.mongodb.net/")
  .then(() => console.log("Connected!"))
  .catch((err) => console.log("Not Connected!"));

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
