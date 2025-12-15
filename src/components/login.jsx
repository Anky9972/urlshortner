import { useState } from 'react'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { BeatLoader } from 'react-spinners'
import Error from './error'
import * as Yup from 'yup'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { UrlState } from '@/context'

const Login = () => {
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const longlink = searchParams.get("createNew");
  const { login } = UrlState();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrors({});
    setApiError(null);

    try {
      const schema = Yup.object().shape({
        email: Yup.string().email("Invalid Email").required("Email is Required"),
        password: Yup.string().min(6, "Password must be at least 6 characters").required("Password is Required"),
      });

      await schema.validate(formData, { abortEarly: false });

      setLoading(true);
      await login(formData.email, formData.password);
      navigate(`/dashboard?${longlink ? `createNew=${longlink}` : ""}`);
    } catch (e) {
      if (e.inner) {
        const newErrors = {};
        e.inner.forEach((err) => {
          newErrors[err.path] = err.message;
        });
        setErrors(newErrors);
      } else {
        setApiError(e.message);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      {apiError && <Error message={apiError} />}

      <div className="space-y-2">
        <label className="text-sm text-zinc-400">Email</label>
        <Input
          name="email"
          type="email"
          placeholder="you@example.com"
          value={formData.email}
          onChange={handleInputChange}
          className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-cyan-500/50"
        />
        {errors.email && <Error message={errors.email} />}
      </div>

      <div className="space-y-2">
        <label className="text-sm text-zinc-400">Password</label>
        <Input
          name="password"
          type="password"
          placeholder="••••••••"
          value={formData.password}
          onChange={handleInputChange}
          className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-cyan-500/50"
        />
        {errors.password && <Error message={errors.password} />}
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-cyan-500 hover:bg-cyan-400 text-zinc-900 font-semibold h-11"
      >
        {loading ? <BeatLoader size={8} color="#09090b" /> : "Sign In"}
      </Button>
    </form>
  )
}

export default Login
