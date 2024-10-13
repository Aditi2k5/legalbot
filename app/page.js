'use client'
import { useState, useEffect, useRef } from "react";
import { Box, Stack, TextField, Button, Typography, AppBar, Toolbar, Container } from '@mui/material';

export default function Home() {
  const [messages, setMessages] = useState([{
    role: 'assistant',
    content: `Hi! I'm LegalBot, your personal AI powered assistant to help with any queries regarding legalese terms and content. What can I help you with today?`
  }]);

  const [message, setMessage] = useState('');
  const messageEndRef = useRef(null);

  const sendMessage = async () => {
    if (!message.trim()) return;
    setMessage('');
    setMessages((prevMessages) => [
      ...prevMessages,
      { role: 'user', content: message },
      { role: 'assistant', content: '' },
    ]);

    const response = fetch('api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([...messages, { role: 'user', content: message }]),
    }).then(async (res) => {
      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      return reader.read().then(function processText({ done, value }) {
        if (done) {
          return;
        }
        const text = decoder.decode(value || new Int8Array, { stream: true });
        setMessages((messages) => {
          let lastMessage = messages[messages.length - 1];
          let otherMessages = messages.slice(0, messages.length - 1);
          return [
            ...otherMessages,
            {
              ...lastMessage,
              content: lastMessage.content + text
            },
          ];
        });
        return reader.read().then(processText);
      });
    });
  };

  useEffect(() => {
    // Auto-scroll to the bottom when new messages arrive
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <Box
      width='100vw'
      height='100vh'
      display='flex'
      flexDirection='column'
      alignItems='center'
      justifyContent='center'
      sx={{
        backgroundColor: 'grey', // light blue background
      }}
    >
      {/* Navbar */}
      <AppBar position="static" sx={{ backgroundColor: 'orange' }}>
        <Toolbar>
          <Container maxWidth="lg">
            <Typography variant="h2" color="black" align="center" >
              LegalBot
            </Typography>
          </Container>
        </Toolbar>
      </AppBar>

      <Stack
        direction='column'
        width='100%'
        height='100%'
        p={2}
        spacing={3}
        bgcolor='grey' // light blue
        mt={2} // Margin top to create space for the navbar
      >
        <Stack
          direction='column'
          spacing={2}
          flexGrow={2}
          overflow='auto'
          maxHeight='100%'
          sx={{
            '&::-webkit-scrollbar': {
              width: '2em'
            },
            '&::-webkit-scrollbar-track': {
              boxShadow: 'inset 0 0 6px rgba(0,0,0,0.00)',
              webkitBoxShadow: 'inset 0 0 6px rgba(0,0,0,0.00)'
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: 'rgba(0,0,0,.1)',
              outline: '1px solid slategrey'
            }
          }}
        >
          {messages.map((message, index) => (
            <Box
              key={index}
              display='flex'
              justifyContent={
                message.role === 'assistant' ? 'flex-start' : 'flex-end'
              }
            >
              <Box
                bgcolor={
                  message.role === 'assistant' ? '#ffcc99' : '#ffebcc' // light orange for assistant, lighter orange for user
                }
                color="black"
                borderRadius={16}
                p={2}
                maxWidth="80%"
                sx={{
                  boxShadow: 1,
                  border: '2px solid',
                  borderColor: message.role === 'assistant' ? '#ffa366' : '#ffd699'
                }}
              >
                {/* Larger font size for messages */}
                <Typography variant="body1" fontSize="1.5rem"> 
                  {message.content}
                </Typography>
              </Box>
            </Box>
          ))}
          <div ref={messageEndRef} />
        </Stack>
        <Stack
          direction='row'
          spacing={2}
        >
          <TextField
            label='Ask about legalese'
            fullWidth
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            variant="outlined"
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: 'black', // light blue border
                },
                '&:hover fieldset': {
                  borderColor: 'orange', // slightly darker blue on hover
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#3385ff',
                },
              },
            }}
          />
          <Button
            variant='contained'
            onClick={sendMessage}
            sx={{
              bgcolor: '#ff9933', // orange background
              color: 'black', // black text
              '&:hover': {
                bgcolor: '#e68a00', // darker orange on hover
              }
            }}
          >
            Send
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
