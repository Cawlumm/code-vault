import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Component } from 'react';
export class ErrorBoundary extends Component {
    state = {
        hasError: false
    };
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }
    componentDidCatch(error, errorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }
    render() {
        if (this.state.hasError) {
            return (_jsxs("div", { className: "error-boundary", children: [_jsx("h2", { children: "Something went wrong" }), _jsx("p", { children: this.state.error?.message }), _jsx("button", { onClick: () => this.setState({ hasError: false }), children: "Try again" })] }));
        }
        return this.props.children;
    }
}
