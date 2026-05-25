import Role from "../models/Role.js"; 

export const getAllRoles = async (req, res) => {
    try{
        const roles = await Role.find().sort({ createdAt: 'desc' }); 
        res.status(200).json(roles);
    }catch(error){
        console.log("Lỗi lấy danh sách vai trò:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi lấy danh sách vai trò",
      error: error.message,
    });
  }
};

export const createRole = async (req, res) => {
  try {
    const { code, name} = req.body;

    const newRole = new Role({
      code,
      name
    });
    const savedRole = await newRole.save();
    res.status(201).json(savedRole);
  } catch (error) {
    console.log("Lỗi thêm vai trò:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi thêm vai trò",
      error: error.message,
    });
  }
};
     
export const updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, is_deleted } = req.body;
    const updatedRole = await Role.findByIdAndUpdate(
      id,
      {
        name,
        code,
        is_deleted
      },
      { returnDocument: "after" }
    );

    if (!updatedRole) {
      return res.status(404).json({
        success: false,
        message: "Vai trò không tồn tại",
      });
    } 
    res.status(200).json(updatedRole);

  } catch (error) {
    console.log("Lỗi cập nhật vai trò:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi cập nhật vai trò",
      error: error.message,
    });
  }
};

export const deleteRole = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedRole = await Role.findByIdAndDelete(id);
    if (!deletedRole) {
      return res.status(404).json({
        success: false,
        message: "Vai trò không tồn tại",
      });
    }

    res.status(200).json({
      success: true,
      message: "Vai trò đã được xóa",
    });
  } catch (error) {
    console.log("Lỗi xóa vai trò:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi xóa vai trò",
      error: error.message,
    });
  }
};