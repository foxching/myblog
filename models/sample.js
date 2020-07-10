var ContactSchema = module.exports = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    phone: {
        type: Number,
        required: true,
        index: { unique: true }
    },
    messages: [
        {
            title: { type: String, required: true },
            msg: { type: String, required: true }
        }]
}, {
        collection: 'contacts',
        safe: true
    });

module.exports = mongoose.model('Contact', ContactSchema)