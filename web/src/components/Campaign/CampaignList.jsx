import React from 'react';
import CampaignCard from './CampaignCard';

const CampaignList = ({ campaigns, onDonate, onAccept }) => {
  if (campaigns.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500 italic">
        No campaigns found
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {campaigns.map((campaign) => (
        <CampaignCard 
          key={campaign.address}
          campaign={campaign}
          onDonate={onDonate}
          onAccept={onAccept}
        />
      ))}
    </div>
  );
};

export default CampaignList;