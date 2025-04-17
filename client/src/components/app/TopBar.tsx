import { useState, useEffect } from 'react';
import { Link } from 'wouter'; // Keep if used elsewhere, though not directly used in the TopBar structure provided
import {
    Menu, Search, Sun, Moon, BellDot, User, LogOut
} from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import Sidebar from './Sidebar';
// Import the useAuth hook from your AuthContext
import { useAuth } from '@/contexts/AuthContext';

// Removed TopBarProps interface as we will get user from context
// interface TopBarProps {
//   user?: {
//     id: number;
//     username: string;
//   };
// }

// Removed user prop from function signature
const TopBar = () => {
    // Use the useAuth hook to get the current user and the logout function
    const { user, logout, isAuthenticated } = useAuth();

    // Use local state for theme management (as in original code)
    const [theme, setTheme] = useState<'light' | 'dark'>('light');

    // Initialize theme from localStorage or system preference
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            setTheme('dark');
            document.documentElement.classList.add('dark'); // Apply class on initial load
        } else if (savedTheme === 'light') {
            setTheme('light');
            document.documentElement.classList.remove('dark'); // Ensure class is removed on initial load
        } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            setTheme('dark');
            document.documentElement.classList.add('dark'); // Apply dark based on system preference
        } else {
             document.documentElement.classList.remove('dark'); // Default to light
        }
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);

        if (newTheme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };

    const [searchQuery, setSearchQuery] = useState('');

    // Get initials from user name - safely handle null user
    const getInitials = (name: string | undefined) => {
        if (!name) return ''; // Handle case where name is undefined
        return name
            .split(' ')
            .map(part => part[0])
            .join('')
            .toUpperCase();
    };

    return (
        <header className="border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 sticky top-0 z-10">
            <div className="flex justify-between items-center p-4">
                {/* Mobile menu button */}
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="md:hidden">
                            <Menu className="h-5 w-5" />
                            <span className="sr-only">Open menu</span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="p-0">
                        {/* Pass user to Sidebar if needed, or let Sidebar use context */}
                        <Sidebar />
                    </SheetContent>
                </Sheet>

                {/* Search */}
                <div className="relative max-w-lg w-full mx-4 hidden md:block">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
                    <Input
                        type="text"
                        placeholder="Search your documents..."
                        className="w-full pl-10 pr-4 py-2 border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 placeholder:text-neutral-500 dark:placeholder:text-neutral-400 text-neutral-900 dark:text-neutral-100"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Right actions */}
                <div className="flex items-center space-x-4">
                    {/* Theme Toggle Button */}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggleTheme}
                        aria-label="Toggle theme"
                    >
                        {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                    </Button>

                    {/* Notifications Button */}
                    <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Notifications"
                    >
                        <BellDot className="h-5 w-5" />
                    </Button>

                    {/* User Dropdown Menu - Only render if authenticated */}
                    {isAuthenticated && user ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    // Use context user for avatar/initials
                                    className="w-8 h-8 rounded-full bg-neutral-200 dark:bg-neutral-700 p-0 font-medium text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:ring-offset-2 dark:focus:ring-offset-neutral-900"
                                    variant="ghost"
                                >
                                    {/* Use user.username from context */}
                                    {/* Assuming user might have an 'avatar' property or just use initials */}
                                    {user.avatar ? ( // Check if user object has an avatar property
                                        <img
                                            src={user.avatar} // Use the actual avatar URL if available
                                            alt={user.username}
                                            className="w-full h-full rounded-full object-cover"
                                        />
                                    ) : ( // Fallback to ui-avatars or initials
                                         // Safely use user.username for ui-avatars
                                        <img
                                             src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&background=random&color=fff`}
                                             alt={user.username}
                                             className="w-full h-full rounded-full object-cover"
                                         />
                                        // Or just initials: <span>{getInitials(user.username)}</span>
                                    )}
                                    <span className="sr-only">Open user menu</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                {/* Use user.username from context for label */}
                                <DropdownMenuLabel>{user.username}</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="cursor-pointer"> {/* Add cursor style */}
                                    <User className="mr-2 h-4 w-4" />
                                    <span>Profile</span>
                                </DropdownMenuItem>
                                {/* Logout Menu Item - Add onSelect to call logout */}
                                <DropdownMenuItem
                                    onSelect={logout}
                                    className="cursor-pointer text-red-600 dark:text-red-400" // Style logout distinctly
                                >
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>Log out</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        // Optional: Render a login button or nothing if not authenticated
                        // <Link href="/login">
                        //   <Button>Login</Button>
                        // </Link>
                        null // Render nothing if not authenticated
                    )}
                </div>
            </div>
        </header>
    );
};

export default TopBar;