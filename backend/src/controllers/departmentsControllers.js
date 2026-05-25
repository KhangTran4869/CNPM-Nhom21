import Department from "../models/Department.js"; 

export const getAllDepartments = async (req, res) => {
    try{
        const departments = await Department.find().sort({ createdAt: 'desc' }); 
        res.status(200).json(departments);
    }catch(error){
        console.log("Lỗi lấy danh sách bộ môn:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi lấy danh sách bộ môn",
      error: error.message,
    });
  }
};

export const createDepartment = async (req, res) => {
  try {
    const { code, name, description } = req.body;
    const newDepartment = new Department({
      code,
      name,
      description
    });
    const savedDepartment = await newDepartment.save(); 
    res.status(201).json(savedDepartment);

  } catch (error) {
    console.log("Lỗi thêm bộ môn:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi thêm bộ môn",
      error: error.message,
    });
  }
};

export const updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, is_deleted } = req.body;
    const updatedDepartment = await Department.findByIdAndUpdate(
      id,
      {
        name,
        description,
        is_deleted
      },
      { returnDocument: "after" }
    );

    if (!updatedDepartment) {
      return res.status(404).json({
        success: false,
        message: "Bộ môn không tồn tại",
      });
    }

    res.status(200).json(updatedDepartment);

  } catch (error) {
    console.log("Lỗi cập nhật bộ môn:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi cập nhật bộ môn",
      error: error.message,
    });
  }
};

export const deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedDepartment = await Department.findByIdAndDelete(id);
    if (!deletedDepartment) {
      return res.status(404).json({
        success: false,
        message: "Bộ môn không tồn tại",
      });
    }

    res.status(200).json({
      success: true,
      message: "Bộ môn đã được xóa",
    });
  } catch (error) {
    console.log("Lỗi xóa bộ môn:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi xóa bộ môn",
      error: error.message,
    });
  }
};