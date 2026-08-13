import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, User } from 'lucide-react';
import Logo from '../components/Logo';
import PhotoCarousel from '../components/PhotoCarousel';
import TextField from '../components/TextField';
import SelectCard from '../components/SelectCard';
import Button from '../components/Button';

// The two sides of the product are two different applications that happen to
// share a database, so which one you get is settled here rather than by a
// toggle inside one of them.
const ROLES = [
  {
    id: 'family',
    letter: 'a',
    title: 'I need care for a parent',
    description: 'Answer some questions and we find someone near you',
  },
  {
    id: 'caregiver',
    letter: 'b',
    title: 'I am a caregiver',
    description: 'Take requests from families, agree terms, get paid',
  },
];

export default function Register({ onContinue }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('family');
  const valid = name.trim() && /\S+@\S+\.\S+/.test(email);

  const submit = () => valid && onContinue({ name: name.trim(), email: email.trim(), role });

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
        <div className="role-choice">
          <p className="tf-label">I am here as</p>
          {ROLES.map((r) => (
            <SelectCard
              key={r.id}
              letter={r.letter}
              title={r.title}
              description={r.description}
              selected={role === r.id}
              onClick={() => setRole(r.id)}
            />
          ))}
        </div>

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
