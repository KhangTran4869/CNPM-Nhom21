import User from "../models/User.js"; 

export const getAllUsers = async (req, res) => {
    try{
        const users = await User.find().sort({ createdAt: 'desc' }); 
        res.status(200).json(users);
    }catch(error){
        console.log("Lỗi lấy danh sách người dùng:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi lấy danh sách người dùng",
      error: error.message,
    });
  }
};

export const createUser = async (req, res) => {
  try {
    const { username, password_hash, role_id, status } = req.body;

    const newUser = new User({
        username,
        password_hash,
        role_id,
        status
    });
    const savedUser= await newUser.save(); 
    res.status(201).json(savedUser);
  } catch (error) {
    console.log("Lỗi thêm người dùng:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi thêm người dùng",
      error: error.message,
    });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, password_hash, role_id, status, is_deleted } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        username,
        password_hash,
        role_id,
        status,
        is_deleted
      },
      { returnDocument: "after" }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "Người dùng không tồn tại",
      });
    }

    res.status(200).json(updatedUser);

  } catch (error) {
    console.log("Lỗi cập nhật người dùng:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi cập nhật người dùng",
      error: error.message,
    });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
      return res.status(404).json({
        success: false,
        message: "Người dùng không tồn tại",
      });
    }

    res.status(200).json({
      success: true,
      message: "Người dùng đã được xóa",
    });
  } catch (error) {
    console.log("Lỗi xóa người dùng:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi xóa người dùng",
      error: error.message,
    });
  }
};