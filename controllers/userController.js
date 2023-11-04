import UserModel from "../models/userModel.js";

export const createUser = async (req, res) => {
    const { name, email, phone, address } = req.body;
    try {
        await UserModel.create({ name, email, phone, address })
        res.status(200).json({ message: "User created successfull" });
    } catch (error) {
        res.status(500).json({ message: "Server error" })
    }
}

export const getUser = async (req, res) => {
    const page = req.query.page || 1
    const ITEM_PER_PAGE = 2
    const skip = (page - 1) * ITEM_PER_PAGE;

    try {
        const user = await UserModel.find({}).sort({ createdAt: -1 }).limit(ITEM_PER_PAGE).skip(skip);
        const tatalPage = await UserModel.countDocuments(user);
        const pageCount = Math.ceil(tatalPage / ITEM_PER_PAGE)
        res.status(200).json({
            pagenation: {
                pageCount,
                tatalPage
            },
            user
        })
    } catch (error) {
        res.status(500).json({ message: "Server error" })
    }
}

export const getUserById = async (req, res) => {
    const { id } = req.params;
    try {
        const user = await UserModel.findById({ _id: id });
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: "Server error" })
    }
}

export const updateUser = async (req, res) => {
    const { id } = req.params;
    console.log(id, req.body)
    try {
        const user = await UserModel.findByIdAndUpdate({ _id: id }, { $set: req.body }, { new: true });
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: "Server error" })
    }
}

export const deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        const user = await UserModel.findOneAndDelete({ _id: id });
        res.status(200).json({ message: "user delete successfull" });
    } catch (error) {
        res.status(500).json({ message: "Server error" })
    }
}

