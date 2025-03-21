import React from 'react';

interface GiversClientProps {
  givers: any[]; // Replace 'any' with the appropriate type for givers
  totalDonations: Record<string, number>;
  userRole: string;
  defaultMosqueId: string | null;
}

const GiversClient: React.FC<GiversClientProps> = ({
  givers,
  totalDonations,
  userRole,
  defaultMosqueId,
}) => {
  return (
    <div>
      <h2>Givers List</h2>
      {/* Render the list of givers and their total donations */}
      {givers.map((giver) => (
        <div key={giver.id}>
          <h3>{giver.name}</h3>
          <p>Total Donations: {totalDonations[giver.id] || 0}</p>
        </div>
      ))}
    </div>
  );
};

export default GiversClient;
