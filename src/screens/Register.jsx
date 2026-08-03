import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, User } from 'lucide-react';
import Logo from '../components/Logo';
import PhotoCarousel from '../components/PhotoCarousel';
import TextField from '../components/TextField';
import Button from '../components/Button';

export default function Register({ onContinue }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const valid = name.trim() && /\S+@\S+\.\S+/.test(email);

  const submit = () => valid && onContinue({ name: name.trim(), email: email.trim() });

  return (
    <motion.div
      className="register"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } }}
      exit={{ opacity: 0, y: -16, transition: { duration: 0.2, ease: 'easeIn' } }}
    >
      <Logo width={150} />
      <PhotoCarousel />
      <div className="welcome">
        <h1>Welcome to NANA Prime</h1>
        <p>To continue fill in required fields</p>
      </div>
      <div className="form-card">
        <TextField
          label="Name and lastname"
          icon={User}
          placeholder="Petar Miric"
          value={name}
          onChange={setName}
          onEnter={submit}
        />
        <TextField
          label="Email"
          icon={Mail}
          placeholder="petar@mail.com"
          type="email"
          value={email}
          onChange={setEmail}
          onEnter={submit}
        />
      </div>
      <div className="actions">
        <Button variant="primary" size="lg" full disabled={!valid} onClick={submit}>
          Continue
        </Button>
        <Button variant="ghost" size="lg">
          Already have an account?
        </Button>
      </div>
    </motion.div>
  );
}
