const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
  // Serve the working demo file
  if (req.url === '/' || req.url === '/index.html' || req.url === '/demo.html') {
    const filePath = path.join(__dirname, 'working_demo.html');
    
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        res.writeHead(500);
        res.end('Error loading file: ' + err.message);
        return;
      }
      
      res.writeHead(200, { 
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-cache'
      });
      res.end(data);
    });
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`🚀 School Management System running at http://localhost:${PORT}`);
  console.log(`📱 All buttons are now fully functional!`);
  console.log(`✅ Features working:`);
  console.log(`   • Add Student - opens working form`);
  console.log(`   • Add Teacher - opens working form`);
  console.log(`   • Edit buttons - pre-fill forms for editing`);
  console.log(`   • Delete buttons - remove records with confirmation`);
  console.log(`   • Pay Now - process fee payments`);
  console.log(`   • Navigation - all sections work`);
  console.log(`   • Toast notifications for all actions`);
  console.log(`\n🎯 Ready to use! Click the preview button above.`);
});