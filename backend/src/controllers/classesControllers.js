import Class from "../models/Class.js"; 

export const getAllClasses = async (req, res) => {
    try{
        const classes = await Class.find().sort({ createdAt: 'desc' }); 
        res.status(200).json(classes);
    }catch(error){
        console.log("Lỗi lấy danh sách lớp học:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi lấy danh sách lớp học",
      error: error.message,
    });
  }
};

export const createClass = async (req, res) => {
  try {
    const { code, course_id, semester_id, status, max_students } = req.body;

    const newClass = new Class({
        code,
        course_id,
        semester_id,
        status,
        max_students
    });
    const savedClass = await newClass.save(); 
    res.status(201).json(savedClass);
  } catch (error) {
    console.log("Lỗi thêm lớp học:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi thêm lớp học",
      error: error.message,
    });
  }
};

export const updateClass = async (req, res) => {
  try {
    const { id } = req.params;
    const { code, course_id, semester_id, status, max_students, is_deleted } = req.body;
    const updatedClass = await Class.findByIdAndUpdate(
      id,
      {
        code,
        course_id,
        semester_id,
        status,
        max_students, 
        is_deleted
      },
      { returnDocument: "after" }
    );

    if (!updatedClass) {
      return res.status(404).json({
        success: false,
        message: "Lớp học không tồn tại",
      });
    }

    res.status(200).json(updatedClass);

  } catch (error) {
    console.log("Lỗi cập nhật lớp học:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi cập nhật lớp học",
      error: error.message,
    });
  }
};

export const deleteClass = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedClass = await Class.findByIdAndDelete(id);
    if (!deletedClass) {
      return res.status(404).json({
        success: false,
        message: "Lớp học không tồn tại",
      });
    }

    res.status(200).json({
      success: true,
      message: "Lớp học đã được xóa",
    });
  } catch (error) {
    console.log("Lỗi xóa lớp học:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi xóa lớp học",
      error: error.message,
    });
  }
};