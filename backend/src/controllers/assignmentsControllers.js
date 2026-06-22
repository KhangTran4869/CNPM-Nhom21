import Assignment from "../models/Assignment.js"; 

export const getAllAssignments = async (req, res) => {
    try{
        const assignments = await Assignment.find().sort({ createdAt: 'desc' }); 
        res.status(200).json(assignments);
    }catch(error){
        console.log("Lỗi lấy danh sách nhiệm vụ:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi lấy danh sách nhiệm vụ",
      error: error.message,
    });
  }
};

export const createAssignment = async (req, res) => {
  try {
    const { class_id, lecturer_id, status, assigned_by, note } = req.body;

    const newAssignment = new Assignment({
      class_id,
      lecturer_id,
      status,
      assigned_by,
      note
    });
    const savedAssignment = await newAssignment.save(); 
    res.status(201).json(savedAssignment);
  } catch (error) {
    console.log("Lỗi thêm nhiệm vụ:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi thêm nhiệm vụ",
      error: error.message,
    });
  }
};

export const updateAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const { class_id, lecturer_id, status, assignment_by, note, is_deleted } = req.body;
    const updatedAssignment = await Assignment.findByIdAndUpdate(
      id,
      {
        class_id,
        lecturer_id,
        status,
        assignment_by,
        note, 
        is_deleted
      },
      { returnDocument: "after" }
    );

    if (!updatedAssignment) {
      return res.status(404).json({
        success: false,
        message: "Nhiệm vụ không tồn tại",
      });
    }

    res.status(200).json(updatedAssignment);

  } catch (error) {
    console.log("Lỗi cập nhật nhiệm vụ:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi cập nhật nhiệm vụ",
      error: error.message,
    });
  }
};

export const deleteAssignment = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedAssignment = await Assignment.findByIdAndDelete(id);
    if (!deletedAssignment) {
      return res.status(404).json({
        success: false,
        message: "Nhiệm vụ không tồn tại",
      });
    }

    res.status(200).json({
      success: true,
      message: "Nhiệm vụ đã được xóa",
    });
  } catch (error) {
    console.log("Lỗi xóa nhiệm vụ:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi xóa nhiệm vụ",
      error: error.message,
    });
  }
};