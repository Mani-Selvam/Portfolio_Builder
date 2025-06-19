import { Link } from "wouter";

export default function SimpleLanding() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
            <div className="container mx-auto px-4 py-16">
                <div className="text-center max-w-4xl mx-auto">
                    <h1 className="text-5xl font-bold text-gray-900 mb-6">
                        Portfolio Website Generator
                    </h1>
                    <p className="text-xl text-gray-600 mb-8">
                        Create professional portfolio submissions with our
                        easy-to-use form system
                    </p>

                    <div className="grid md:grid-cols-2 gap-8 mt-12">
                        <div className="bg-white p-8 rounded-lg shadow-lg">
                            <h3 className="text-2xl font-semibold mb-4">
                                For Clients
                            </h3>
                            <p className="text-gray-600 mb-6">
                                Submit your portfolio information, upload your
                                resume, and showcase your projects
                            </p>
                            <Link href="/submit">
                                <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
                                    Submit Portfolio
                                </button>
                            </Link>
                        </div>

                        <div className="bg-white p-8 rounded-lg shadow-lg">
                            <h3 className="text-2xl font-semibold mb-4">
                                For Admins
                            </h3>
                            <p className="text-gray-600 mb-6">
                                Manage submissions, review portfolios, and track
                                application status
                            </p>
                            <Link href="/admin/login">
                                <button className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors">
                                    Admin Login
                                </button>
                            </Link>
                        </div>
                    </div>

                    <div className="mt-16 text-center">
                        <h2 className="text-3xl font-bold text-gray-900 mb-8">
                            Features
                        </h2>
                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="bg-white p-6 rounded-lg shadow">
                                <h4 className="font-semibold text-lg mb-2">
                                    File Uploads
                                </h4>
                                <p className="text-gray-600">
                                    Upload resumes, photos, and project
                                    screenshots
                                </p>
                            </div>
                            <div className="bg-white p-6 rounded-lg shadow">
                                <h4 className="font-semibold text-lg mb-2">
                                    Admin Dashboard
                                </h4>
                                <p className="text-gray-600">
                                    Comprehensive management and tracking system
                                </p>
                            </div>
                            <div className="bg-white p-6 rounded-lg shadow">
                                <h4 className="font-semibold text-lg mb-2">
                                    Status Tracking
                                </h4>
                                <p className="text-gray-600">
                                    Monitor application progress and completion
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
