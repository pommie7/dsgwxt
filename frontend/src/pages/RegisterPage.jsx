import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register as registerApi } from '../api/auth';
import { useAuth } from '../store/authContext';

export default function RegisterPage() {
  const [form, setForm] = useState({ username: '', password: '', confirmPassword: '', email: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const updateField = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { username, password, confirmPassword, email } = form;

    if (!username.trim() || !password || !email.trim()) {
      setError('请填写所有必填字段');
      return;
    }
    if (password.length < 6) {
      setError('密码长度不能少于6位');
      return;
    }
    if (password !== confirmPassword) {
      setError('两次密码输入不一致');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await registerApi({ username: username.trim(), password, email: email.trim() });
      login(res.data.token, res.data.user);
      navigate('/products');
    } catch (err) {
      const msg = err.response?.data?.message || '注册失败，请稍后重试';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>📝 用户注册</h2>
        {error && <div className="error-msg">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>用户名 *</label>
            <input type="text" value={form.username} onChange={updateField('username')} placeholder="3-50个字符" autoFocus />
          </div>
          <div className="form-group">
            <label>邮箱 *</label>
            <input type="email" value={form.email} onChange={updateField('email')} placeholder="example@mail.com" />
          </div>
          <div className="form-group">
            <label>密码 *</label>
            <input type="password" value={form.password} onChange={updateField('password')} placeholder="至少6位" />
          </div>
          <div className="form-group">
            <label>确认密码 *</label>
            <input type="password" value={form.confirmPassword} onChange={updateField('confirmPassword')} placeholder="再次输入密码" />
          </div>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? '注册中...' : '注 册'}
          </button>
        </form>
        <div className="auth-link">
          已有账户？<Link to="/login">立即登录</Link>
        </div>
      </div>
    </div>
  );
}
