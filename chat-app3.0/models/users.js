var UserSchema = new mongoose.Schema
      ({
          username: String,
          creationDate: {type:Date, default:Date}
      })
      module.exports = mongoose.model('Users', UserSchema);