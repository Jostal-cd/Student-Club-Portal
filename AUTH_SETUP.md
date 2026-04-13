# Authentication System Documentation

## Overview
This document describes the enhanced login and signup system for the Student Club Portal.

## Files Created/Updated

### Frontend Pages

#### 1. **Login Page** (`html/login.html`)
**Features:**
- Modern gradient design with professional styling
- Username and password input fields
- Password visibility toggle (👁️ button)
- "Remember me" checkbox for credential storage
- Error and success message alerts
- Link to signup page for new users
- Back to home link
- Responsive mobile design

**Key Elements:**
- Gradient header with portal branding
- Professional form styling with focus states
- Loading state during login
- Form validation

#### 2. **Signup Page** (`html/signup.html`)
**Features:**
- Account creation form with the following fields:
  - First Name & Last Name
  - Username (alphanumeric, min 3 characters)
  - Email address
  - Account Type (Club Member/Faculty)
  - Password with visibility toggle
  - Confirm Password
  - Terms acceptance checkbox
- Real-time password strength indicator:
  - Weak (red)
  - Fair (amber)
  - Good (blue)
  - Strong (green)
- Comprehensive form validation
- Link to login page
- Responsive design

### JavaScript Files

#### 1. **Login Script** (`js/login.js`)
**Functionality:**
- Form validation
- Handles password visibility toggle
- Manages "Remember me" localStorage
- Async login request to backend
- Role-based dashboard redirection (club/faculty)
- Error handling with user-friendly messages
- Success confirmation before redirect
- Input clearing on error

**Key Features:**
```javascript
- Password visibility toggle
- Credential persistence
- Token storage in localStorage
- Role-based routing
- Comprehensive error messages
```

#### 2. **Signup Script** (`js/signup.js`)
**Functionality:**
- Real-time password strength checking
- Comprehensive form validation
- Email format validation
- Username format validation (alphanumeric + underscore only)
- Password match verification
- Terms acceptance enforcement
- Async registration request to backend
- Success redirect to login page

**Validation Rules:**
```
- Names: minimum 2 characters
- Username: 3+ characters, alphanumeric + underscore only
- Email: valid email format
- Password: minimum 6 characters
- Passwords: must match
- Terms: must be accepted before signup
```

## Backend Integration

### Required API Endpoints

#### 1. POST `/api/auth/login`
**Request:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response (Success):**
```json
{
  "token": "jwt_token_string",
  "role": "club" | "faculty",
  "username": "string"
}
```

**Existing Implementation:** ✅ Already implemented in `routes/auth.js`

#### 2. POST `/api/auth/register` (Needs to be created)
**Request:**
```json
{
  "firstname": "string",
  "lastname": "string",
  "username": "string",
  "email": "string",
  "role": "club" | "faculty",
  "password": "string"
}
```

**Response (Success):**
```json
{
  "msg": "User registered successfully",
  "token": "jwt_token_string",
  "role": "club" | "faculty"
}
```

### Backend Setup Required

You need to add a registration endpoint to `routes/auth.js`:

```javascript
// @route   POST api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
    const { firstname, lastname, username, email, role, password } = req.body;

    try {
        // Check if user exists
        let user = await User.findOne({ $or: [{ username }, { email }] });
        
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        // Create new user
        user = new User({
            firstname,
            lastname,
            username,
            email,
            role,
            password
        });

        // Hash password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        // Save user
        await user.save();

        // Generate JWT
        const payload = {
            user: {
                id: user.id,
                role: user.role
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: 360000 },
            (err, token) => {
                if (err) throw err;
                res.json({ token, role: user.role, msg: 'User registered successfully' });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server Error', error: err.message });
    }
});
```

## User Experience Flow

### Login Flow
1. User visits `/html/login.html`
2. Enters username and password
3. Optionally checks "Remember me" to save credentials
4. Clicks "Login"
5. System validates and sends credentials to backend
6. On success: Token saved, user redirected to dashboard
7. On error: Clear error message displayed

### Signup Flow
1. User visits `/html/signup.html` or clicks "Sign Up" button
2. Fills in registration form
3. Real-time password strength feedback
4. Clicks "Create Account"
5. Form validation runs client-side
6. On success: Account created, user redirected to login
7. On error: Clear error message displayed

## Styling Features

### Color Scheme
- **Primary Gradient:** `#667eea` to `#764ba2` (purple)
- **Success:** Green (`#dcfce7` background, `#166534` text)
- **Error:** Red (`#fee2e2` background, `#991b1b` text)

### Responsive Design
- Mobile-first approach
- Breakpoint at 480px for mobile adjustments
- Flexible padding for different screen sizes

## Browser Compatibility
- Chrome/Edge 88+
- Firefox 85+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Security Notes
1. Passwords are hashed using bcrypt on the backend
2. JWT tokens are used for session management
3. Tokens stored in localStorage for persistence
4. HTTPS recommended for production
5. Password field not visible by default
6. Form validation prevents common attacks

## Future Enhancements
- [ ] Forgot password functionality
- [ ] Email verification on signup
- [ ] Two-factor authentication (2FA)
- [ ] Social login (Google, GitHub)
- [ ] Account profile completion after signup
- [ ] Email confirmation link
- [ ] Anti-spam/rate limiting

## Testing Checklist
- [ ] Login with valid credentials
- [ ] Login with invalid credentials
- [ ] Signup with all required fields
- [ ] Signup with invalid email
- [ ] Password visibility toggle working
- [ ] Remember me functionality
- [ ] Password strength indicator accuracy
- [ ] Form validation messages clear
- [ ] Responsive design on mobile
- [ ] Redirect to correct dashboard after login
