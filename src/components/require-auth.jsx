import { UrlState } from '@/context';
import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { BarLoader } from 'react-spinners';

function RequireAuth  ({children}) {
    const navigate = useNavigate();
    const {loading, isAuthenticated} = UrlState();

    useEffect(()=>{
        if(!isAuthenticated && loading === false) navigate("/auth");
    },[isAuthenticated,loading]);

    if(loading) return <BarLoader width={"100%"} color="#36d7b7"/>
    if(isAuthenticated) return children;
  return (
    <div>RequireAuth</div>
  )
}

export default RequireAuth