import mongoose from "mongoose";

const clientSchema = new mongoose.Schema(
    {
        company_name: { type: String, required: true },

        country: { type: String, required: true },

        entity_type: { type: String, required: true },

        govt_id: {
            type: String,
            unique: true,
            sparse: true, // allows null values
            validate: {
                validator: function (v) {
                    return v.length >= 5; // basic validation
                },
                message: "Invalid govt ID",
            },
        },

        govt_id_type: {
            type: String, // GSTIN, CIN, EIN, VAT, etc.
        },
    },
    { timestamps: true }
);

export default mongoose.model("Client", clientSchema);