import Layout from "../layout/Layout";

export default function DashboardPage() {
  return (
    <Layout>
      <div className="p-6 bg-white rounded-xl shadow-md border border-gray-100">
        <h2 className="text-2xl font-semibold text-blue-700 mb-4">
          Dashboard Overview
        </h2>
        <p className="text-gray-600">
          Welcome to your MLM system dashboard! Here you can manage your users,
          view wallet details, and monitor commissions.
        </p>
      </div>
    </Layout>
  );
}
