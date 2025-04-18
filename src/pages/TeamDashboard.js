import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Chip,
  Avatar,
  LinearProgress,
  Divider,
  Paper,
  Tab,
  Tabs,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  TextField,
  InputAdornment
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import FilterListIcon from '@mui/icons-material/FilterList';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import BusinessIcon from '@mui/icons-material/Business';
import WorkIcon from '@mui/icons-material/Work';
import SchoolIcon from '@mui/icons-material/School';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import SortIcon from '@mui/icons-material/Sort';
import BarChartIcon from '@mui/icons-material/BarChart';
import PieChartIcon from '@mui/icons-material/PieChart';
import GroupIcon from '@mui/icons-material/Group';

// Mock data for departments
const DEPARTMENTS = [
  'Engineering',
  'Sales',
  'Marketing',
  'Human Resources',
  'Finance',
  'Product',
  'Customer Support',
  'Legal'
];

// Mock data for team members
const generateMockTeamMembers = () => {
  const roles = [
    'Software Engineer', 
    'Product Manager', 
    'Data Scientist', 
    'UX Designer', 
    'Sales Representative', 
    'Marketing Specialist',
    'HR Manager',
    'Financial Analyst'
  ];
  
  const names = [
    'Emma Thompson', 
    'James Wilson', 
    'Olivia Martinez', 
    'William Johnson', 
    'Sophia Lee', 
    'Benjamin Davis',
    'Ava Rodriguez',
    'Alexander Brown',
    'Mia Garcia',
    'Ethan Miller',
    'Isabella Taylor',
    'Daniel Anderson',
    'Charlotte Thomas',
    'Matthew Jackson',
    'Amelia White',
    'David Harris',
    'Harper Martin',
    'Joseph Thompson',
    'Evelyn Clark',
    'Michael Lewis'
  ];
  
  const trainingPlans = [
    'Dell Product Training',
    'Leadership Development',
    'Technical Skills',
    'Customer Service Excellence',
    'Project Management',
    'Data Analysis',
    'Communication Skills',
    'Compliance Training'
  ];
  
  return Array.from({ length: 50 }, (_, i) => {
    const department = DEPARTMENTS[Math.floor(Math.random() * DEPARTMENTS.length)];
    const role = roles[Math.floor(Math.random() * roles.length)];
    const name = names[Math.floor(Math.random() * names.length)];
    
    // Generate 1-3 training plans for each user
    const numPlans = Math.floor(Math.random() * 3) + 1;
    const plans = Array.from({ length: numPlans }, () => {
      const planName = trainingPlans[Math.floor(Math.random() * trainingPlans.length)];
      const progress = Math.floor(Math.random() * 101); // 0-100%
      const daysTotal = Math.floor(Math.random() * 10) + 3; // 3-12 days
      const daysCompleted = Math.floor((progress / 100) * daysTotal);
      
      return {
        name: planName,
        progress,
        daysCompleted,
        daysTotal,
        lastActive: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)).toISOString() // Random date within last week
      };
    });
    
    // Calculate average progress across all plans
    const averageProgress = Math.floor(plans.reduce((sum, plan) => sum + plan.progress, 0) / plans.length);
    
    return {
      id: i + 1,
      name,
      department,
      role,
      email: name.toLowerCase().replace(' ', '.') + '@dell.com',
      avatar: `/avatars/avatar${(i % 12) + 1}.jpg`, // Mock avatar path
      plans,
      averageProgress,
      joinDate: new Date(Date.now() - Math.floor(Math.random() * 365 * 24 * 60 * 60 * 1000)).toISOString() // Random date within last year
    };
  });
};

const TeamDashboard = () => {
  const theme = useTheme();
  const [teamMembers, setTeamMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [anchorEl, setAnchorEl] = useState(null);
  
  // Initialize with mock data
  useEffect(() => {
    const mockData = generateMockTeamMembers();
    setTeamMembers(mockData);
    setFilteredMembers(mockData);
  }, []);
  
  // Filter and sort team members
  useEffect(() => {
    let filtered = [...teamMembers];
    
    // Filter by department
    if (selectedDepartment !== 'All') {
      filtered = filtered.filter(member => member.department === selectedDepartment);
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(member => 
        member.name.toLowerCase().includes(query) || 
        member.role.toLowerCase().includes(query) ||
        member.email.toLowerCase().includes(query) ||
        member.plans.some(plan => plan.name.toLowerCase().includes(query))
      );
    }
    
    // Sort results
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'department':
          comparison = a.department.localeCompare(b.department);
          break;
        case 'progress':
          comparison = a.averageProgress - b.averageProgress;
          break;
        case 'role':
          comparison = a.role.localeCompare(b.role);
          break;
        default:
          comparison = 0;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
    
    setFilteredMembers(filtered);
  }, [teamMembers, selectedDepartment, searchQuery, sortBy, sortDirection]);
  
  // Handle sort menu
  const handleSortClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleSortClose = () => {
    setAnchorEl(null);
  };
  
  const handleSortSelect = (field) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('asc');
    }
    handleSortClose();
  };
  
  // Calculate department statistics
  const departmentStats = DEPARTMENTS.map(department => {
    const membersInDept = teamMembers.filter(member => member.department === department);
    const avgProgress = membersInDept.length > 0 
      ? Math.floor(membersInDept.reduce((sum, member) => sum + member.averageProgress, 0) / membersInDept.length)
      : 0;
    
    return {
      name: department,
      memberCount: membersInDept.length,
      averageProgress: avgProgress
    };
  }).sort((a, b) => b.memberCount - a.memberCount);
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700, color: '#1565C0' }}>
          Team Training Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Monitor your team's training progress across all departments
        </Typography>
      </Box>
      
      {/* Department Overview */}
      <Paper elevation={0} sx={{ p: 3, mb: 4, bgcolor: 'rgba(21, 101, 192, 0.05)', borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <BusinessIcon sx={{ color: '#1565C0', mr: 1 }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Department Overview
          </Typography>
        </Box>
        
        <Grid container spacing={3}>
          {departmentStats.map((dept) => (
            <Grid item xs={12} sm={6} md={3} key={dept.name}>
              <Card elevation={0} sx={{ 
                bgcolor: 'white', 
                borderRadius: 2,
                height: '100%',
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  transform: 'translateY(-4px)'
                }
              }}>
                <CardContent>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                    {dept.name}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <GroupIcon sx={{ color: '#1565C0', fontSize: 20, mr: 1 }} />
                    <Typography variant="body2">
                      {dept.memberCount} team members
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mb: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2" color="text.secondary">
                        Avg. Progress
                      </Typography>
                      <Typography variant="body2" fontWeight="medium" color="primary">
                        {dept.averageProgress}%
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={dept.averageProgress} 
                      sx={{ 
                        height: 6, 
                        borderRadius: 3,
                        bgcolor: 'rgba(21, 101, 192, 0.1)',
                        '& .MuiLinearProgress-bar': {
                          bgcolor: '#1565C0'
                        }
                      }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>
      
      {/* Filters and Search */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3, alignItems: 'center' }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel id="department-filter-label">Department</InputLabel>
          <Select
            labelId="department-filter-label"
            id="department-filter"
            value={selectedDepartment}
            label="Department"
            onChange={(e) => setSelectedDepartment(e.target.value)}
            size="small"
          >
            <MenuItem value="All">All Departments</MenuItem>
            {DEPARTMENTS.map(dept => (
              <MenuItem key={dept} value={dept}>{dept}</MenuItem>
            ))}
          </Select>
        </FormControl>
        
        <TextField
          placeholder="Search team members..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          size="small"
          sx={{ flexGrow: 1 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        
        <Button 
          variant="outlined" 
          startIcon={<SortIcon />}
          onClick={handleSortClick}
          size="small"
        >
          Sort By
        </Button>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleSortClose}
        >
          <MenuItem onClick={() => handleSortSelect('name')}>
            Name {sortBy === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
          </MenuItem>
          <MenuItem onClick={() => handleSortSelect('department')}>
            Department {sortBy === 'department' && (sortDirection === 'asc' ? '↑' : '↓')}
          </MenuItem>
          <MenuItem onClick={() => handleSortSelect('role')}>
            Role {sortBy === 'role' && (sortDirection === 'asc' ? '↑' : '↓')}
          </MenuItem>
          <MenuItem onClick={() => handleSortSelect('progress')}>
            Progress {sortBy === 'progress' && (sortDirection === 'asc' ? '↑' : '↓')}
          </MenuItem>
        </Menu>
      </Box>
      
      {/* Team Members */}
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        Team Members ({filteredMembers.length})
      </Typography>
      
      <Grid container spacing={3}>
        {filteredMembers.map((member) => (
          <Grid item xs={12} md={6} key={member.id}>
            <Card sx={{ 
              borderRadius: 2,
              overflow: 'hidden',
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: '0 8px 24px rgba(21, 101, 192, 0.15)',
                transform: 'translateY(-4px)'
              }
            }}>
              <Box sx={{ 
                p: 2, 
                display: 'flex', 
                borderBottom: '1px solid rgba(0, 0, 0, 0.08)'
              }}>
                <Avatar 
                  src={member.avatar} 
                  alt={member.name}
                  sx={{ width: 56, height: 56, mr: 2 }}
                />
                <Box sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {member.name}
                    </Typography>
                    <Chip 
                      label={member.department} 
                      size="small" 
                      color="primary" 
                      variant="outlined"
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    {member.role}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {member.email}
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="subtitle2">
                    Training Progress
                  </Typography>
                  <Typography variant="subtitle2" color="primary" fontWeight="bold">
                    {member.averageProgress}%
                  </Typography>
                </Box>
                
                <LinearProgress 
                  variant="determinate" 
                  value={member.averageProgress} 
                  sx={{ 
                    height: 8, 
                    borderRadius: 4,
                    mb: 2,
                    bgcolor: 'rgba(21, 101, 192, 0.1)',
                    '& .MuiLinearProgress-bar': {
                      bgcolor: '#1565C0'
                    }
                  }}
                />
                
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Training Plans
                </Typography>
                
                {member.plans.map((plan, index) => (
                  <Box key={index} sx={{ mb: index < member.plans.length - 1 ? 2 : 0 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2" fontWeight="medium">
                        {plan.name}
                      </Typography>
                      <Typography variant="body2" color={plan.progress === 100 ? 'success.main' : 'text.secondary'}>
                        {plan.progress}%
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                      <LinearProgress 
                        variant="determinate" 
                        value={plan.progress} 
                        sx={{ 
                          height: 4, 
                          borderRadius: 2,
                          flexGrow: 1,
                          mr: 1,
                          bgcolor: 'rgba(0, 0, 0, 0.08)',
                          '& .MuiLinearProgress-bar': {
                            bgcolor: plan.progress === 100 ? '#4caf50' : '#1565C0'
                          }
                        }}
                      />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="caption" color="text.secondary">
                        {plan.daysCompleted} of {plan.daysTotal} days completed
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Last active: {new Date(plan.lastActive).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
      
      {filteredMembers.length === 0 && (
        <Box sx={{ 
          py: 6, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          bgcolor: 'rgba(0, 0, 0, 0.02)',
          borderRadius: 2
        }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No team members found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Try adjusting your filters or search query
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default TeamDashboard;
