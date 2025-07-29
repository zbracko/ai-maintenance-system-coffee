import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Typography,
  Paper,
} from '@mui/material';

interface FormState {
  serialNumber: string;
  task: string;
  image: File | null;
  checklist: string;
}

interface FormErrors {
  serialNumber?: string;
  task?: string;
  image?: string;
  checklist?: string;
}

const DataEntryForm: React.FC = () => {
  const [form, setForm] = useState<FormState>({
    serialNumber: '',
    task: '',
    image: null,
    checklist: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, files } = e.target as HTMLInputElement & { name?: string; value: unknown };

    if (name === 'image' && files) {
      setForm({
        ...form,
        image: files[0],
      });
    } else {
      setForm({
        ...form,
        [name as string]: value,
      });
    }
  };

  const handleSelectChange = (event: any) => {
    const { name, value } = event.target;
    setForm({
      ...form,
      [name]: value,
    });
  };

  const validate = (): boolean => {
    let temp: FormErrors = {};
    temp.serialNumber = form.serialNumber ? '' : 'This field is required.';
    temp.task = form.task ? '' : 'This field is required.';
    temp.image = form.image ? '' : 'Image is required.';
    temp.checklist = form.checklist ? '' : 'This field is required.';
    setErrors(temp);

    return Object.values(temp).every((x) => x === '');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      // Normally, submit the form data to the backend
      alert('Form submitted successfully!');
      // Reset form
      setForm({
        serialNumber: '',
        task: '',
        image: null,
        checklist: '',
      });
      setErrors({});
    } else {
      alert('Please fill in all mandatory fields.');
    }
  };

  return (
    <Paper
      sx={{
        p: 4,
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(148, 163, 184, 0.2)',
        borderRadius: '16px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        maxWidth: '600px',
        mx: 'auto',
        width: '100%'
      }}
    >
      <Box
        component="form"
        onSubmit={handleSubmit}
        display="flex"
        flexDirection="column"
      >
        <Typography 
          variant="h4" 
          gutterBottom 
          sx={{ 
            color: '#1e293b',
            fontWeight: 700,
            mb: 3,
            textAlign: 'center'
          }}
        >
          Guided Data Entry Form
        </Typography>

      <FormControl fullWidth margin="normal" error={Boolean(errors.serialNumber)}>
        <TextField
          label="Serial Number"
          name="serialNumber"
          value={form.serialNumber}
          onChange={handleChange}
          required
        />
        {errors.serialNumber && <FormHelperText>{errors.serialNumber}</FormHelperText>}
      </FormControl>

      <FormControl fullWidth margin="normal" error={Boolean(errors.task)}>
        <InputLabel id="task-label">Task</InputLabel>
        <Select
          labelId="task-label"
          name="task"
          value={form.task}
          label="Task"
          onChange={handleSelectChange}
          required
        >
          <MenuItem value="Inspection">Inspection</MenuItem>
          <MenuItem value="Repair">Repair</MenuItem>
          <MenuItem value="Maintenance">Maintenance</MenuItem>
        </Select>
        {errors.task && <FormHelperText>{errors.task}</FormHelperText>}
      </FormControl>

      <FormControl fullWidth margin="normal" error={Boolean(errors.image)}>
        <Button variant="contained" component="label">
          Upload Image
          <input type="file" hidden name="image" accept="image/*" onChange={handleChange} />
        </Button>
        {form.image && <Box mt={1}>{form.image.name}</Box>}
        {errors.image && <FormHelperText>{errors.image}</FormHelperText>}
      </FormControl>

      <FormControl fullWidth margin="normal" error={Boolean(errors.checklist)}>
        <TextField
          label="Completion Checklist"
          name="checklist"
          multiline
          rows={4}
          value={form.checklist}
          onChange={handleChange}
          required
        />
        {errors.checklist && <FormHelperText>{errors.checklist}</FormHelperText>}
      </FormControl>

        <Box mt={2}>
          <Button type="submit" variant="contained" color="primary" fullWidth>
            Submit Log
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default DataEntryForm;
