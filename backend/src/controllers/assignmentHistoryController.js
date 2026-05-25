import AssignmentHistory from "../models/AssignmentHistory.js"; 

export const getAllAssignmentsHistory = async (req, res) => {
    try{
        const assignmentHistory = await AssignmentHistory.find().sort({ createdAt: 'desc' }); 
        res.status(200).json(assignmentHistory);
    }catch(error){
        console.log("Lỗi lấy danh sách lịch sử nhiệm vụ:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi lấy danh sách lịch sử nhiệm vụ",
      error: error.message,
    });
  }
};

export const createAssignmentHistory = async (req, res) => {
  try {
    const { assignment_id, old_lecturer_id, new_lecturer_id, changed_at } = req.body;

    const newAssignmentHistory = new AssignmentHistory({
      assignment_id,
      old_lecturer_id,
      new_lecturer_id,
      changed_at: changed_at || Date.now(),
    });
    const savedAssignmentHistory = await newAssignmentHistory.save(); 
    res.status(201).json(savedAssignmentHistory);
  } catch (error) {
    console.log("Lỗi thêm lịch sử nhiệm vụ:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi thêm lịch sử nhiệm vụ",
      error: error.message,
    });
  }
};

export const updateAssignmentHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const { assignment_id, old_lecturer_id, new_lecturer_id, changed_at, is_deleted } = req.body;
    const updatedAssignmentHistory = await AssignmentHistory.findByIdAndUpdate(
      id,
      {
        assignment_id,
        old_lecturer_id,
        new_lecturer_id,
        changed_at,
        is_deleted
      },
      { returnDocument: "after" }
    );

    if (!updatedAssignmentHistory) {
      return res.status(404).json({
        success: false,
        message: "Lịch sử nhiệm vụ không tồn tại",
      });
    }

    res.status(200).json(updatedAssignmentHistory);

  } catch (error) {
    console.log("Lỗi cập nhật lịch sử nhiệm vụ:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi cập nhật lịch sử nhiệm vụ",
      error: error.message,
    });
  }
};

export const deleteAssignmentHistory = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedAssignmentHistory = await AssignmentHistory.findByIdAndDelete(id);
    if (!deletedAssignmentHistory) {
      return res.status(404).json({
        success: false,
        message: "Lịch sử nhiệm vụ không tồn tại",
      });
    }

    res.status(200).json({
      success: true,
      message: "Lịch sử nhiệm vụ đã được xóa",
    });
  } catch (error) {
    console.log("Lỗi xóa lịch sử nhiệm vụ:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi xóa lịch sử nhiệm vụ",
      error: error.message,
    });
  }
};