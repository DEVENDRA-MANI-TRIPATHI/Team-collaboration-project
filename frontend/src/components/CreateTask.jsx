import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Autocomplete from '@mui/material/Autocomplete';
import CircularProgress from '@mui/material/CircularProgress';
import useAuth from '../hooks/useAuth';

export default function CreateTask({ open, onClose, onCreated }) {
  const { accessToken } = useAuth();
  const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [usersError, setUsersError] = useState('');

  const [assignee, setAssignee] = useState(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setTitle('');
    setDescription('');
    setAssignee(null);
    setError('');
    setUsersError('');
    setSubmitting(false);

    const fetchUsers = async () => {
      setLoadingUsers(true);
      try {
        const { data } = await axios.get(`${baseURL}/auth/allusers`, {
          withCredentials: true,
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const mapped = (data || []).map(u => ({
          ...u,
          display: u.username || u.name || u.email || 'Unknown',
        }));
        setUsers(mapped);
      } catch (err) {
        setUsersError(err?.response?.data?.message || 'Failed to load users');
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  }, [open, baseURL, accessToken]);

  const getOptionLabel = (option) => {
    if (!option) return '';
    const label = option.username || option.name || option.email || option.display || '';
    if (option.email && label !== option.email) {
      return `${label} (${option.email})`;
    }
    return label;
  };

  const isOptionEqualToValue = (opt, val) => String(opt._id) === String(val._id);

  const submit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim() || !assignee?._id) {
      setError('Title and Assignee are required');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        title: title.trim(),
        description,
        assignedTo: assignee._id,
      };

      const { data } = await axios.post(`${baseURL}/task`, payload, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (onCreated) onCreated(data);
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to create task');
    } finally {
      setSubmitting(false);
    }
  };

  const helper = useMemo(() => {
    if (usersError) return usersError;
    if (loadingUsers) return 'Loading users...';
    return 'Select a user to assign this task to';
  }, [usersError, loadingUsers]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Create Task</DialogTitle>
      <DialogContent>
        <form onSubmit={submit}>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {error && <Alert severity="error">{error}</Alert>}

            <TextField
              label="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
              required
              fullWidth
            />

            <TextField
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              multiline
              minRows={2}
              fullWidth
            />

            <Autocomplete
              options={users}
              value={assignee}
              onChange={(_e, val) => setAssignee(val)}
              loading={loadingUsers}
              getOptionLabel={getOptionLabel}
              isOptionEqualToValue={isOptionEqualToValue}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Assign to"
                  placeholder="Search users"
                  required
                  helperText={helper}
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {loadingUsers ? <CircularProgress color="inherit" size={18} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
            />

            <DialogActions sx={{ px: 0 }}>
              <Button onClick={onClose} disabled={submitting}>Cancel</Button>
              <Button type="submit" variant="contained" disabled={submitting || loadingUsers}>
                {submitting ? 'Creating...' : 'Create'}
              </Button>
            </DialogActions>
          </Stack>
        </form>
      </DialogContent>
    </Dialog>
  );
}
