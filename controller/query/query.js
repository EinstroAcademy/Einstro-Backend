const { Subject, Branch } = require("../../schema/subject.schema");

const subjects = [
  "All", "Accounting", "Actuarial Science", "Advertising", "Agriculture", "Anthropology", 
  "Archaeology", "Architecture", "Art and Design", "Astronomy", "Biochemistry", "Biology", 
  "Biomedical Engineering", "Biotechnology", "Business Administration", "Chemical Engineering", 
  "Chemistry", "Child Development", "Civil Engineering", "Classics", "Communications", 
  "Computer Science", "Construction Management", "Cultural Studies", "Data Science", 
  "Dentistry", "Drama", "Ecology", "Economics", "Education", "Electrical Engineering", 
  "Energy Studies", "Engineering", "English Literature", "Environmental Science", 
  "Ethnic Studies", "Fashion Design", "Film Studies", "Finance", "Fine Arts", "Food Science", 
  "Forensic Science", "Forestry", "Geography", "Geology", "Graphic Design", "Health Sciences", 
  "History", "Hospitality Management", "Human Resources", "Information Technology", 
  "International Relations", "Journalism", "Landscape Architecture", "Law", "Library Science", 
  "Linguistics", "Marine Biology", "Marketing", "Materials Science", "Mathematics", 
  "Mechanical Engineering", "Media Studies", "Medicine", "Microbiology", "Music", 
  "Nanotechnology", "Nursing", "Nutrition", "Occupational Therapy", "Pharmaceutical Sciences", 
  "Philosophy", "Physics", "Physiotherapy", "Political Science", "Psychology", 
  "Public Administration", "Public Health", "Public Relations", "Real Estate", 
  "Religious Studies", "Robotics", "Social Work", "Sociology", "Software Engineering", 
  "Special Education", "Sports Management", "Statistics", "Supply Chain Management", 
  "Sustainable Development", "Theater", "Theology", "Tourism and Hospitality", 
  "Urban Planning", "Veterinary Science", "Web Development", "Women's Studies", "Zoology"
];

const branches = [
  "Financial Accounting", "Managerial Accounting", "Taxation", "Auditing", "Forensic Accounting",
  "Risk Management", "Financial Mathematics", "Insurance", "Pension Funds", "Investment",
  "Creative Advertising", "Media Planning", "Digital Advertising", "Public Relations", "Brand Management",
  "Agronomy", "Horticulture", "Animal Science", "Soil Science", "Agricultural Economics",
  "Cultural Anthropology", "Biological Anthropology", "Archaeology", "Linguistic Anthropology", "Applied Anthropology",
  "Prehistoric Archaeology", "Classical Archaeology", "Egyptology", "Bioarchaeology", "Archaeometry",
  "Landscape Architecture", "Urban Planning", "Interior Design", "Architectural Engineering", "Historic Preservation",
  "Graphic Design", "Fashion Design", "Industrial Design", "Fine Arts", "Photography",
  "Astrophysics", "Cosmology", "Planetary Science", "Stellar Astronomy", "Galactic Astronomy",
  "Molecular Biology", "Cell Biology", "Genetics", "Proteomics", "Metabolomics",
  "Zoology", "Botany", "Microbiology", "Ecology", "Marine Biology",
  "Bioinformatics", "Biomaterials", "Biomechanics", "Medical Imaging", "Tissue Engineering",
  "Genetic Engineering", "Pharmaceutical Biotechnology", "Agricultural Biotechnology", "Environmental Biotechnology", "Industrial Biotechnology",
  "Management", "Marketing", "Finance", "Human Resources", "Operations Management",
  "Process Engineering", "Biochemical Engineering", "Materials Science", "Environmental Engineering", "Energy Engineering"
];

// Function to seed data
const updateSubjectAndBranch=async(req,res)=> {
  try {
    

    // Insert subjects
    const subjectDocs = subjects.map(name => ({ name }));
    await Subject.insertMany(subjectDocs);
    console.log('Subjects inserted successfully');

    // Insert branches
    const branchDocs = branches.map(name => ({ name }));
    await Branch.insertMany(branchDocs);
    console.log('Branches inserted successfully');

    console.log('Data seeding completed');
  } catch (error) {
    console.error('Error seeding data:', error);
  }
}

module.exports= {updateSubjectAndBranch}