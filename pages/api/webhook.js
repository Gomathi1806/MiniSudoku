// pages/api/webhook.js
export default function handler(req, res) {
  console.log('Webhook called:', req.method);
  
  res.status(200).json({ 
    success: true,
    message: "Mini Sudoku webhook working!",
    method: req.method,
    timestamp: new Date().toISOString()
  });
}
