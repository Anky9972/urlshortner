import React from 'react';
import { useRouteError, isRouteErrorResponse } from 'react-router-dom';
import PropTypes from 'prop-types';
import NotFoundPage from '@/pages/not-found';

// Error Boundary Component for catching component errors
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static propTypes = {
    children: PropTypes.node.isRequired
  };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return <ErrorUI error={this.state.error} />;
    }

    return this.props.children;
  }
}

// Route Error Component for handling route-level errors
export function RouteError() {
  const error = useRouteError();
  
  if (isRouteErrorResponse(error)) {
    return <ErrorUI 
      error={{
        status: error.status,
        statusText: error.statusText,
        message: error.data?.message
      }} 
    />;
  }

  return <ErrorUI error={error} />;
}

// Define prop types for the error object
const errorPropType = PropTypes.oneOfType([
  PropTypes.instanceOf(Error),
  PropTypes.shape({
    status: PropTypes.number,
    statusText: PropTypes.string,
    message: PropTypes.string,
    stack: PropTypes.string,
    toString: PropTypes.func
  })
]);

// Shared Error UI Component
function ErrorUI({ error }) {
  const isNotFound = error?.status === 404;
  
  return (
    <NotFoundPage isNotFound={isNotFound}/>
  );
}

ErrorUI.propTypes = {
  error: errorPropType
};

// Optional default props for ErrorUI
ErrorUI.PropTypes = {
  error: {
    status: 500,
    statusText: 'Internal Server Error',
    message: 'An unexpected error occurred'
  }
};