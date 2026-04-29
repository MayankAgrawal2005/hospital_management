const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const email = process.argv[2] || "admin@example.com";
const password = process.argv[3] || "admin123";

mongoose.connect(process.env.MONGO)
  .then(async () => {
    let user = await User.findOne({ email });

    if (!user) {
      console.log(`\n⏳ Account not found. Creating fresh Admin account for: ${email}...`);
      const hashedPassword = await bcrypt.hash(password, 10);
      user = await User.create({
        name: "Super Admin",
        email,
        password: hashedPassword,
        role: 'admin'
      });
      console.log(`\n✅ CREATED! You can now log in with:\n📧 Email: ${email}\n🔑 Password: ${password}`);
    } else {
      console.log(`\n⏳ User found. Promoting ${user.name} to Admin...`);
      user.role = 'admin';
      await user.save();
      console.log(`\n🎉 PROMOTED! ${user.email} is now an Admin!`);
    }
    
    process.exit(0);
  })
  .catch(err => {
    console.log("Error:", err);
    process.exit(1);
  });
