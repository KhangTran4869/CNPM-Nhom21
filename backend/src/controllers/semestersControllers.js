import Semester from "../models/Semester.js"; 

export const getAllSemesters = async (req, res) => {
    try{
        const semesters = await Semester.find().sort({ createdAt: 'desc' }); 
        res.status(200).json(semesters);
    }catch(error){
        console.log("Lỗi lấy danh sách học kỳ:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi lấy danh sách học kỳ",
      error: error.message,
    });
  }
};

export const createSemester = async (req, res) => {
  try {
    const { name, start_date, end_date } = req.body;

    const newSemester = new Semester({
        name,
        start_date,
        end_date
    });
    const savedSemester = await newSemester.save(); 
    res.status(201).json(savedSemester);
  } catch (error) {
    console.log("Lỗi thêm học kỳ:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi thêm học kỳ",
      error: error.message,
    });
  }
};

export const updateSemester = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, start_date, end_date, is_deleted } = req.body;
    const updatedSemester = await Semester.findByIdAndUpdate(
      id,
      {
        name,
        start_date,
        end_date,
        is_deleted
      },
      { returnDocument: "after" }
    );

    if (!updatedSemester) {
      return res.status(404).json({
        success: false,
        message: "Học kỳ không tồn tại",
      });
    }

    res.status(200).json(updatedSemester);
  } catch (error) {
    console.log("Lỗi cập nhật học kỳ:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi cập nhật học kỳ",
      error: error.message,
    });
  }
};

export const deleteSemester = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedSemester = await Semester.findByIdAndDelete(id);
    if (!deletedSemester) {
      return res.status(404).json({
        success: false,
        message: "Học kỳ không tồn tại",
      });
    }

    res.status(200).json({
      success: true,
      message: "Học kỳ đã được xóa",
    });
  } catch (error) {
    console.log("Lỗi xóa học kỳ:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi xóa học kỳ",
      error: error.message,
    });
  }
};
       