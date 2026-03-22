import mongoose from "mongoose";
import dotenv from "dotenv";
import Client from "./models/Client.js";

dotenv.config();

const seedClients = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    await Client.deleteMany(); // clear old data

    const clients = [
      {
        company_name: "ABC Pvt Ltd",
        country: "India",
        entity_type: "Private Limited",
        govt_id: "29ABCDE1234F1Z5",
        govt_id_type: "GSTIN",
      },
      {
        company_name: "XYZ Enterprises",
        country: "India",
        entity_type: "Sole Proprietorship",
        govt_id: "07ABCDE5678G1Z2",
        govt_id_type: "GSTIN",
      },
      {
        company_name: "Global Tech Inc",
        country: "USA",
        entity_type: "Corporation",
        govt_id: "12-3456789",
        govt_id_type: "EIN",
      },
      {
        company_name: "FinEdge Solutions",
        country: "UK",
        entity_type: "LLP",
        govt_id: "GB123456789",
        govt_id_type: "VAT",
      },
      {
        company_name: "NextGen Labs",
        country: "Germany",
        entity_type: "GmbH",
        govt_id: "DE123456789",
        govt_id_type: "VAT",
      },
      {
        company_name: "Bright Future Co",
        country: "India",
        entity_type: "Partnership",
        govt_id: "19ABCDE9999F1Z1",
        govt_id_type: "GSTIN",
      },
      {
        company_name: "Alpha Traders",
        country: "UAE",
        entity_type: "LLC",
        govt_id: "UAE123456",
        govt_id_type: "Trade License",
      },
      {
        company_name: "Beta Logistics",
        country: "Singapore",
        entity_type: "Private Limited",
        govt_id: "SG987654321",
        govt_id_type: "UEN",
      },
      {
        company_name: "Gamma Retail",
        country: "India",
        entity_type: "Private Limited",
        govt_id: "27ABCDE1111F1Z3",
        govt_id_type: "GSTIN",
      },
      {
        company_name: "Delta Consulting",
        country: "Canada",
        entity_type: "Corporation",
        govt_id: "CA123456789",
        govt_id_type: "Business Number",
      },
    ];

    await Client.insertMany(clients);

    console.log("✅ Clients seeded successfully");
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedClients();