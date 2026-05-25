import Course from "../models/Course.js"; 

export const getAllCourses = async (req, res) => {
    try{
        const courses = await Course.find().sort({ createdAt: 'desc' }); 
        res.status(200).json(courses);
    }catch(error){
        console.log("Lỗi lấy danh sách khóa học:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi lấy danh sách khóa học",
      error: error.message,
    });
  }
};

export const createCourse = async (req, res) => {
  try {
    const { code, name, credits, department_id } = req.body;

    const newCourse = new Course({
        code,  
        name,
        credits,
        department_id
    });
    const savedCourse = await newCourse.save(); 
    res.status(201).json(savedCourse);
  } catch (error) {
    console.log("Lỗi thêm khóa học:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi thêm khóa học",
      error: error.message,
    });
  }
};

export const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { code, name, credits, department_id, is_deleted } = req.body;
    const updatedCourse = await Course.findByIdAndUpdate(
      id,
      {
        code,
        name,
        credits,
        department_id,
        is_deleted
      },
      { returnDocument: "after" }
    );

    if (!updatedCourse) {
      return res.status(404).json({
        success: false,
        message: "Khóa học không tồn tại",
      });
    }

    res.status(200).json(updatedCourse);

  } catch (error) {
    console.log("Lỗi cập nhật khóa học:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi cập nhật khóa học",
      error: error.message,
    });
  }
};

export const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedCourse = await Course.findByIdAndDelete(id);
    if (!deletedCourse) {
      return res.status(404).json({
        success: false,
        message: "Khóa học không tồn tại",
      });
    }

    res.status(200).json({
      success: true,
      message: "Khóa học đã được xóa",
    });
  } catch (error) {
    console.log("Lỗi xóa khóa học:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi xóa khóa học",
      error: error.message,
    });
  }
};