import Schedule from "../models/Schedule.js"; 

export const getAllSchedules = async (req, res) => {
    try{
        const schedules = await Schedule.find().sort({ createdAt: 'desc' }); 
        res.status(200).json(schedules);
    }catch(error){
        console.log("Lỗi lấy danh sách lịch dạy:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi lấy danh sách lịch dạy",
      error: error.message,
    });
  }
};

export const createSchedule = async (req, res) => {
  try {
    const { class_id, day_of_week, start_period, end_period, room_id } = req.body;

    const newSchedule = new Schedule({
        class_id,       
        day_of_week,
        start_period,
        end_period,
        room_id
    });
    const savedSchedule = await newSchedule.save(); 
    res.status(201).json(savedSchedule);
  } catch (error) {
    console.log("Lỗi thêm lịch dạy:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi thêm lịch dạy",
      error: error.message,
    });
  }
};

export const updateSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const { class_id, day_of_week, start_period, end_period, room_id, is_deleted } = req.body;
    const updatedSchedule = await Schedule.findByIdAndUpdate(
      id,
      {
        class_id,
        day_of_week,
        start_period,
        end_period,
        room_id,
        is_deleted
      },
      { returnDocument: "after" }
    );

    if (!updatedSchedule) {
      return res.status(404).json({
        success: false,
        message: "Lịch dạy không tồn tại",
      });
    }

    res.status(200).json(updatedLecturer);

  } catch (error) {
    console.log("Lỗi cập nhật lịch dạy:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi cập nhật lịch dạy",
      error: error.message,
    });
  }
};

export const deleteSchedule = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedSchedule = await Schedule.findByIdAndDelete(id);
    if (!deletedSchedule) {
      return res.status(404).json({
        success: false,
        message: "Lịch dạy không tồn tại",
      });
    }

    res.status(200).json({
      success: true,
      message: "Lịch dạy đã được xóa",
    });
  } catch (error) {
    console.log("Lỗi xóa lịch dạy:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi xóa lịch dạy",
      error: error.message,
    });
  }
};