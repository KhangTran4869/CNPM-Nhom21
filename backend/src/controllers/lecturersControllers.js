import Lecturer from "../models/Lecturer.js"; 

export const getAllLecturers = async (req, res) => {
    try{
        const lecturers = await Lecturer.find().sort({ createdAt: 'desc' }); 
        res.status(200).json(lecturers);
    }catch(error){
        console.log("Lỗi lấy danh sách giảng viên:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi lấy danh sách giảng viên",
      error: error.message,
    });
  }
};

export const createLecturer = async (req, res) => {
  try {
    const { code, name, email, phone, degree, department_id, user_id, max_hours } = req.body;

    const newLecturer = new Lecturer({
      code,
      name,
      email,
      phone,
      degree,
      department_id,
      user_id,
      max_hours,
    });
    const savedLecturer = await newLecturer.save(); 
    res.status(201).json(savedLecturer);
  } catch (error) {
    console.log("Lỗi thêm giảng viên:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi thêm giảng viên",
      error: error.message,
    });
  }
};

export const updateLecturer = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, degree, department_id, user_id, max_hours, status, is_deleted } = req.body;
    const updatedLecturer = await Lecturer.findByIdAndUpdate(
      id,
      {
        name,
        email,
        phone,
        degree,
        department_id,
        user_id,
        max_hours,
        status,
        is_deleted
      },
      { returnDocument: "after" }
    );

    if (!updatedLecturer) {
      return res.status(404).json({
        success: false,
        message: "Giảng viên không tồn tại",
      });
    }

    res.status(200).json(updatedLecturer);

  } catch (error) {
    console.log("Lỗi cập nhật giảng viên:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi cập nhật giảng viên",
      error: error.message,
    });
  }
};

export const deleteLecturer = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedLecturer = await Lecturer.findByIdAndDelete(id);

    if (!deletedLecturer) {
      return res.status(404).json({
        success: false,
        message: "Giảng viên không tồn tại",
      });
    }

    res.status(200).json({
      success: true,
      message: "Giảng viên đã được xóa",
    });
  } catch (error) {
    console.log("Lỗi xóa giảng viên:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi xóa giảng viên",
      error: error.message,
    });
  }
};