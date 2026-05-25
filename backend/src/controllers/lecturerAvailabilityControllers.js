import LecturerAvailability from "../models/LecturerAvailability.js"; 

export const getAllLecturerAvailabilities = async (req, res) => {
    try{
        const lecturerAvailabilities = await LecturerAvailability.find().sort({ createdAt: 'desc' }); 
        res.status(200).json(lecturerAvailabilities);
    }catch(error){
        console.log("Lỗi lấy danh sách giảng viên khả dụng:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi lấy danh sách giảng viên khả dụng",
      error: error.message,
    });
  }
};

export const createLecturerAvailability = async (req, res) => {
  try {
    const { lecturer_id, day_of_week, start_period, end_period, status } = req.body;

    const newLecturerAvailability = new LecturerAvailability({
        lecturer_id,
        day_of_week,
        start_period,
        end_period,
        status
    });
    const savedLecturerAvailability = await newLecturerAvailability.save(); 
    res.status(201).json(savedLecturerAvailability);
  } catch (error) {
    console.log("Lỗi thêm giảng viên khả dụng:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi thêm giảng viên khả dụng",
      error: error.message,
    });
  }
};

export const updateLecturerAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const { lecturer_id, day_of_week, start_period, end_period, status, is_deleted } = req.body;
    const updatedLecturerAvailability = await LecturerAvailability.findByIdAndUpdate(
      id,
      {
        lecturer_id,
        day_of_week,
        start_period,
        end_period,
        status,
        is_deleted
      },
      { returnDocument: "after" }
    );

    if (!updatedLecturerAvailability) {
      return res.status(404).json({
        success: false,
        message: "Giảng viên khả dụng không tồn tại",
      });
    }

    res.status(200).json(updatedLecturerAvailability);

  } catch (error) {
    console.log("Lỗi cập nhật giảng viên khả dụng:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi cập nhật giảng viên khả dụng",
      error: error.message,
    });
  }
};

export const deleteLecturerAvailability = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedLecturerAvailability = await LecturerAvailability.findByIdAndDelete(id);
    if (!deletedLecturerAvailability) {
      return res.status(404).json({
        success: false,
        message: "Giảng viên khả dụng không tồn tại",
      });
    }

    res.status(200).json({
      success: true,
      message: "Giảng viên khả dụng đã được xóa",
    });
  } catch (error) {
    console.log("Lỗi xóa giảng viên khả dụng:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi xóa giảng viên khả dụng",
      error: error.message,
    });
  }
};