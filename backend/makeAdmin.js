const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const email = process.argv[2];

if (!email) {
  console.log("Please provide an email address as the first argument.");
  process.exit(1);
}

mongoose.connect(process.env.MONGO)
  .then(async () => {
    const user = await User.findOneAndUpdate({ email }, { role: 'admin' }, { new: true });
    if (user) {
      console.log(`\n🎉 SUCCESS! ${user.name} (${user.email}) is now a Super Admin!\n`);
    } else {
      console.log(`\n❌ Could not find a user with the email: ${email}\n`);
    }
    process.exit(0);
  })
  .catch(err => {
    console.log(err);
    process.exit(1);
  });
