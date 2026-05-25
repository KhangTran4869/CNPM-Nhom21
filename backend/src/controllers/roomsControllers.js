import Room from "../models/Room.js"; 

export const getAllRooms = async (req, res) => {
    try{
        const rooms = await Room.find().sort({ createdAt: 'desc' }); 
        res.status(200).json(rooms);
    }catch(error){
        console.log("Lỗi lấy danh sách phòng:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi lấy danh sách phòng",
      error: error.message,
    });
  }
};

export const createRoom = async (req, res) => {
  try {
    const { name, capacity } = req.body;

    const newRoom = new Room({
      name,
      capacity
    });
    const savedRoom = await newRoom.save(); 
    res.status(201).json(savedRoom);
  } catch (error) {
    console.log("Lỗi thêm phòng:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi thêm phòng",
      error: error.message,
    });
  }
};

export const updateRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, capacity, is_deleted } = req.body;
    const updatedRoom = await Room.findByIdAndUpdate(
      id,
      {
        name,
        capacity,
        is_deleted
      },
      { returnDocument: "after" }
    );

    if (!updatedRoom) {
      return res.status(404).json({
        success: false,
        message: "Phòng không tồn tại",
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

export const deleteRoom = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedRoom = await Room.findByIdAndDelete(id);

    if (!deletedRoom) {
      return res.status(404).json({
        success: false,
        message: "Phòng không tồn tại",
      });
    }

    res.status(200).json({
      success: true,
      message: "Phòng đã được xóa",
    });
  } catch (error) {
    console.log("Lỗi xóa phòng:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi xóa phòng",
      error: error.message,
    });
  }
};