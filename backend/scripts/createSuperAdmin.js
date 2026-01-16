// Script to create the first super admin account
// Run this with: node backend/scripts/createSuperAdmin.js

import bcrypt from 'bcryptjs';
import { supabase } from '../configs/database.js';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function createSuperAdmin() {
  try {
    console.log('\n🔐 Create Super Admin Account\n');
    console.log('='.repeat(50));
    
    // Get email
    const email = await question('Enter email: ');
    if (!email || !email.includes('@')) {
      console.error('❌ Invalid email');
      rl.close();
      return;
    }

    // Check if email already exists
    const { data: existing } = await supabase
      .from('platform_users')
      .select('id')
      .eq('email', email)
      .single();

    if (existing) {
      console.error(`❌ Email ${email} already exists!`);
      rl.close();
      return;
    }

    // Get password
    const password = await question('Enter password (min 6 characters): ');
    if (!password || password.length < 6) {
      console.error('❌ Password must be at least 6 characters');
      rl.close();
      return;
    }

    // Confirm password
    const confirmPassword = await question('Confirm password: ');
    if (password !== confirmPassword) {
      console.error('❌ Passwords do not match');
      rl.close();
      return;
    }

    // Hash password
    console.log('\n⏳ Hashing password...');
    const passwordHash = await bcrypt.hash(password, 10);

    // Insert into database
    console.log('⏳ Creating super admin account...');
    const { data, error } = await supabase
      .from('platform_users')
      .insert([{
        email: email,
        password_hash: passwordHash,
        role: 'super_admin'
      }])
      .select()
      .single();

    if (error) {
      console.error('❌ Error creating account:', error.message);
      rl.close();
      return;
    }

    console.log('\n✅ Super admin account created successfully!');
    console.log('='.repeat(50));
    console.log(`Email: ${data.email}`);
    console.log(`ID: ${data.id}`);
    console.log(`Role: ${data.role}`);
    console.log(`Created at: ${data.created_at}`);
    console.log('='.repeat(50));
    console.log('\n✨ You can now login with these credentials!\n');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  } finally {
    rl.close();
  }
}

// Run the script
createSuperAdmin();
