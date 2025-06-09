window.addEventListener("DOMContentLoaded", async () => {
  if (window.ethereum) {
    window.provider = new ethers.BrowserProvider(window.ethereum);
    window.factory = new ethers.Contract(factoryAddress, factoryABI, window.provider);

    // must popup for prod
    const accounts = await window.provider.send("eth_accounts", []);

    if (accounts.length > 0) {
      const address = accounts[0];
      window.signer = await window.provider.getSigner();

      document.getElementById("walletAddress").innerText = "Wallet: " + address;
      document.getElementById("donationToken").innerText = "Donation Token: " + (await window.factory.getApproverToken(address));
      document.getElementById("buttonConnect").style.display = "none";
      document.getElementById("buttonDisconnect").style.display = "inline-block";

      document.getElementById("buttonCreateCampaign").style.display = "inline-block";
      document.getElementById("buttonHistory").style.display = "inline-block";
      document.getElementById("buttonMyCampaigns").style.display = "inline-block";
    } else {
      document.getElementById("walletAddress").innerText = "";
      document.getElementById("donationToken").innerText = "";
      document.getElementById("buttonConnect").style.display = "inline-block";
      document.getElementById("buttonDisconnect").style.display = "none";

      document.getElementById("buttonCreateCampaign").style.display = "none";
      document.getElementById("buttonHistory").style.display = "none";
      document.getElementById("buttonMyCampaigns").style.display = "none";
    }

    await getAllCampaigns();
  } else {
    alert("Please install MetaMask to use this application");
  }

  window.ethereum.on("accountsChanged", async (accounts) => {
    if (accounts.length > 0) {
      const address = accounts[0];
      window.signer = await window.provider.getSigner();

      document.getElementById("walletAddress").innerText = "Wallet: " + address;
      document.getElementById("donationToken").innerText = "Donation Token: " + (await window.factory.getApproverToken(address));
      document.getElementById("buttonConnect").style.display = "none";
      document.getElementById("buttonDisconnect").style.display = "inline-block";

      document.getElementById("buttonCreateCampaign").style.display = "inline-block";
      document.getElementById("buttonHistory").style.display = "inline-block";
      document.getElementById("buttonMyCampaigns").style.display = "inline-block";
    } else {
      document.getElementById("walletAddress").innerText = "";
      document.getElementById("donationToken").innerText = "";
      document.getElementById("buttonConnect").style.display = "inline-block";
      document.getElementById("buttonDisconnect").style.display = "none";

      document.getElementById("buttonCreateCampaign").style.display = "none";
      document.getElementById("buttonHistory").style.display = "none";
      document.getElementById("buttonMyCampaigns").style.display = "none";

      window.signer = null;
    }

    await getAllCampaigns();
  });
});

async function connectWallet() {
  if (window.ethereum) {
    try {
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      const address = accounts[0];
      window.signer = await window.provider.getSigner();

      document.getElementById("walletAddress").innerText = "Wallet: " + address;
      document.getElementById("donationToken").innerText = "Donation Token: " + (await window.factory.getApproverToken(address));
      document.getElementById("buttonConnect").style.display = "none";
      document.getElementById("buttonDisconnect").style.display = "inline-block";

      document.getElementById("buttonCreateCampaign").style.display = "inline-block";
      document.getElementById("buttonHistory").style.display = "inline-block";
      document.getElementById("buttonMyCampaigns").style.display = "inline-block";
    } catch (err) {
      // TOOD: benerin pesannya
      alert("cancel login");
    }
  } else {
    // TODO: benerin pesannya
    alert("please install metamask");
  }
}

async function getAllCampaigns() {
  if (!window.ethereum) {
    // TODO: benerin pesannya
    alert("please install metamask");
    return;
  }

  document.getElementById("buttonCampaigns").classList.add("active");
  document.getElementById("buttonAllCampaigns").classList.add("active");

  document.getElementById("buttonAllCampaigns").style.display = "inline-block";
  document.getElementById("buttonMyCampaigns").style.display = "inline-block";
  document.getElementById("buttonActiveCampaigns").style.display = "inline-block";
  document.getElementById("buttonInactiveCampaigns").style.display = "inline-block";

  document.getElementById("buttonHistory").classList.remove("active");
  document.getElementById("buttonMyCampaigns").classList.remove("active");
  document.getElementById("buttonActiveCampaigns").classList.remove("active");
  document.getElementById("buttonInactiveCampaigns").classList.remove("active");

  try {
    // reverse to get the newest campaigns
    const campaigns = [...(await window.factory.getAllCampaigns())].reverse();

    const cardsContainer = document.querySelector(".cards");
    cardsContainer.innerHTML = "";

    if (campaigns.length === 0) {
      renderEmptyMessage(cardsContainer, "Campaigns not found.");
      return;
    }

    for (const address of campaigns) {
      const campaign = new ethers.Contract(address, campaignABI, window.provider);

      const [title, description, target, donated, donationTokens, deadline, owner, status] = await Promise.all([
        campaign.title(),
        campaign.description(),
        campaign.targetAmount(),
        campaign.totalTokenDonated(),
        campaign.totalTokenApproved(),
        campaign.deadline(),
        campaign.owner(),
        campaign.isActive(),
      ]);

      const deadlineFormatted = formatTimestamp(deadline);

      const card = document.createElement("div");
      card.className = "card";

      card.innerHTML = `
        <p>Smart Contract: ${address}</p>
        <p>Title: ${title}</p>
        <p>Description: ${description}</p>
        <p>Target: ${ethers.formatEther(target)} ETH</p>
        ${status ? `<p>Donated: ${ethers.formatEther(donated)} ETH</p>` : `<p>Need: ${10 - Number(donationTokens)} Donation Token</p>`}
        <p>Deadline: ${deadlineFormatted}</p>
        <p>Owner: ${owner}</p>
        <button class="donate-btn">${status ? "DONATE" : "ACCEPT"}</button>
      `;

      const donateBtn = card.querySelector(".donate-btn");

      if (status) {
        const targetEth = ethers.formatEther(target);
        const donatedEth = ethers.formatEther(donated);

        const now = Math.floor(Date.now() / 1000);
        if (Number(targetEth) > Number(donatedEth) || now > deadline) {
          donateBtn.addEventListener("click", () => handleDonate(address));
        } else {
          donateBtn.addEventListener("click", () => alert("Donasi sudah selesai"));
        }
      } else {
        donateBtn.addEventListener("click", () => handleAccept(address, donationTokens));
      }

      cardsContainer.appendChild(card);
    }
  } catch (err) {
    console.error("Failed to fetch campaigns:", err);
  }
}

async function getActiveCampaigns() {
  if (!window.ethereum) {
    // TODO: benerin pesannya
    alert("please install metamask");
    return;
  }

  document.getElementById("buttonCampaigns").classList.add("active");
  document.getElementById("buttonActiveCampaigns").classList.add("active");

  document.getElementById("buttonHistory").classList.remove("active");
  document.getElementById("buttonMyCampaigns").classList.remove("active");
  document.getElementById("buttonAllCampaigns").classList.remove("active");
  document.getElementById("buttonInactiveCampaigns").classList.remove("active");

  try {
    // reverse to get the newest campaigns
    const campaigns = [...(await window.factory.getActiveCampaigns())].reverse();

    const cardsContainer = document.querySelector(".cards");
    cardsContainer.innerHTML = "";

    if (campaigns.length === 0) {
      renderEmptyMessage(cardsContainer, "Campaigns not found.");
      return;
    }

    for (const address of campaigns) {
      const campaign = new ethers.Contract(address, campaignABI, window.provider);

      const [title, description, target, donated, deadline, owner] = await Promise.all([
        campaign.title(),
        campaign.description(),
        campaign.targetAmount(),
        campaign.totalTokenDonated(),
        campaign.deadline(),
        campaign.owner(),
      ]);

      const deadlineFormatted = formatTimestamp(deadline);

      const card = document.createElement("div");
      card.className = "card";

      card.innerHTML = `
        <p>Smart Contract: ${address}</p>
        <p>Title: ${title}</p>
        <p>Description: ${description}</p>
        <p>Target: ${ethers.formatEther(target)} ETH</p>
        <p>Donated: ${ethers.formatEther(donated)} ETH</p>
        <p>Deadline: ${deadlineFormatted}</p>
        <p>Owner: ${owner}</p>
        <button class="donate-btn">DONATE</button>
      `;

      const donateBtn = card.querySelector(".donate-btn");

      const targetEth = ethers.formatEther(target);
      const donatedEth = ethers.formatEther(donated);

      const now = Math.floor(Date.now() / 1000);
      if (Number(targetEth) > Number(donatedEth) || now > deadline) {
        donateBtn.addEventListener("click", () => handleDonate(address));
      } else {
        donateBtn.addEventListener("click", () => alert("Donasi sudah selesai"));
      }

      cardsContainer.appendChild(card);
    }
  } catch (err) {
    console.error("Failed to fetch campaigns:", err);
  }
}

async function getInactiveCampaigns() {
  if (!window.ethereum) {
    // TODO: benerin pesannya
    alert("please install metamask");
    return;
  }

  document.getElementById("buttonCampaigns").classList.add("active");
  document.getElementById("buttonInactiveCampaigns").classList.add("active");

  document.getElementById("buttonHistory").classList.remove("active");
  document.getElementById("buttonMyCampaigns").classList.remove("active");
  document.getElementById("buttonAllCampaigns").classList.remove("active");
  document.getElementById("buttonActiveCampaigns").classList.remove("active");

  try {
    // reverse to get the newest campaigns
    const campaigns = [...(await window.factory.getInactiveCampaigns())].reverse();

    const cardsContainer = document.querySelector(".cards");
    cardsContainer.innerHTML = "";

    if (campaigns.length === 0) {
      renderEmptyMessage(cardsContainer, "Campaigns not found.");
      return;
    }

    for (const address of campaigns) {
      const campaign = new ethers.Contract(address, campaignABI, window.provider);

      const [title, description, target, donationTokens, deadline, owner] = await Promise.all([
        campaign.title(),
        campaign.description(),
        campaign.targetAmount(),
        campaign.totalTokenApproved(),
        campaign.deadline(),
        campaign.owner(),
      ]);

      const deadlineFormatted = formatTimestamp(deadline);

      const card = document.createElement("div");
      card.className = "card";

      card.innerHTML = `
        <p>Smart Contract: ${address}</p>
        <p>Title: ${title}</p>
        <p>Description: ${description}</p>
        <p>Target: ${ethers.formatEther(target)} ETH</p>
        <p>Need: ${10 - Number(donationTokens)} Donation Token</p>
        <p>Deadline: ${deadlineFormatted}</p>
        <p>Owner: ${owner}</p>
        <button class="donate-btn">ACCEPT</button>
      `;

      const donateBtn = card.querySelector(".donate-btn");
      donateBtn.addEventListener("click", () => handleAccept(address, donationTokens));

      cardsContainer.appendChild(card);
    }
  } catch (err) {
    console.error("Failed to fetch campaigns:", err);
  }
}

async function getDonationHistory() {
  if (!window.ethereum) {
    // TODO: benerin pesannya
    alert("please install metamask");
    return;
  }

  if (!window.signer) {
    // TODO: benerin pesannya
    alert("login dulu bang");
    return;
  }

  document.getElementById("buttonHistory").classList.add("active");
  document.getElementById("buttonCampaigns").classList.remove("active");

  document.getElementById("buttonAllCampaigns").style.display = "none";
  document.getElementById("buttonMyCampaigns").style.display = "none";
  document.getElementById("buttonActiveCampaigns").style.display = "none";
  document.getElementById("buttonInactiveCampaigns").style.display = "none";

  try {
    // reverse to get the newest campaigns
    const factory = new ethers.Contract(factoryAddress, factoryABI, window.signer);
    const c = await factory.getDonatedCampaigns(window.signer.address);
    const campaigns = [...new Set(c)].reverse();

    const cardsContainer = document.querySelector(".cards");
    cardsContainer.innerHTML = "";

    if (campaigns.length === 0) {
      renderEmptyMessage(cardsContainer, "You haven't donated to any campaigns yet.");
      return;
    }

    for (const address of campaigns) {
      const campaign = new ethers.Contract(address, campaignABI, window.provider);

      const [Title, description, target, deadline, donated, owner] = await Promise.all([
        campaign.title(),
        campaign.description(),
        campaign.targetAmount(),
        campaign.deadline(),
        campaign.totalTokenDonated(),
        campaign.owner(),
      ]);

      const donors = [...(await campaign.getDonors(window.signer.address))].reverse();
      for (const d of donors) {
        const deadlineFormatted = formatTimestamp(deadline);

        const card = document.createElement("div");
        card.className = "card";

        card.innerHTML = `
        <p>Smart Contract: ${address}</p>
        <p>Title: ${Title}</p>
        <p>Description: ${description}</p>
        <p>Target: ${ethers.formatEther(target)} ETH</p>
        <p>Donated: ${ethers.formatEther(donated)} ETH</p>
        <p>Deadline: ${deadlineFormatted}</p>
        <p>Owner: ${owner}</p>
        <p>You donate: ${ethers.formatEther(d)} ETH</p>
      `;

        cardsContainer.appendChild(card);
      }
    }
  } catch (err) {
    console.error("Failed to fetch campaigns:", err);
  }
}

async function getMyCampaigns() {
  if (!window.ethereum) {
    // TODO: benerin pesannya
    alert("please install metamask");
    return;
  }

  if (!window.signer) {
    // TODO: benerin pesannya
    alert("login dulu bang");
    return;
  }

  document.getElementById("buttonCampaigns").classList.add("active");
  document.getElementById("buttonMyCampaigns").classList.add("active");

  document.getElementById("buttonHistory").classList.remove("active");
  document.getElementById("buttonActiveCampaigns").classList.remove("active");
  document.getElementById("buttonAllCampaigns").classList.remove("active");
  document.getElementById("buttonInactiveCampaigns").classList.remove("active");

  try {
    // reverse to get the newest campaigns
    const factory = new ethers.Contract(factoryAddress, factoryABI, window.signer);
    const campaigns = [...(await factory.getCampaignsByOwner(window.signer.address))].reverse();

    const cardsContainer = document.querySelector(".cards");
    cardsContainer.innerHTML = "";

    if (campaigns.length === 0) {
      renderEmptyMessage(cardsContainer, "You haven't created any campaigns yet.");
      return;
    }

    for (const address of campaigns) {
      const campaign = new ethers.Contract(address, campaignABI, window.provider);

      const [title, description, target, donated, donationTokens, deadline, owner, status] = await Promise.all([
        campaign.title(),
        campaign.description(),
        campaign.targetAmount(),
        campaign.totalTokenDonated(),
        campaign.totalTokenApproved(),
        campaign.deadline(),
        campaign.owner(),
        campaign.isActive(),
      ]);

      const deadlineFormatted = formatTimestamp(deadline);

      const card = document.createElement("div");
      card.className = "card";

      card.innerHTML = `
        <p>Smart Contract: ${address}</p>
        <p>Title: ${title}</p>
        <p>Description: ${description}</p>
        <p>Target: ${ethers.formatEther(target)} ETH</p>
        ${status ? `<p>Donated: ${ethers.formatEther(donated)} ETH</p>` : `<p>Need: ${10 - Number(donationTokens)} Donation Token</p>`}
        <p>Deadline: ${deadlineFormatted}</p>
        <p>Owner: ${owner}</p>
        <button class="donate-btn">WITHDRAW</button>
      `;

      const donateBtn = card.querySelector(".donate-btn");
      donateBtn.addEventListener("click", () => handleWithdraw(address, donationTokens));

      cardsContainer.appendChild(card);
    }
  } catch (err) {
    console.error("Failed to fetch campaigns:", err);
  }
}

function openModal() {
  if (!window.signer) {
    alert("harus connect metamask terlebih dahulu");
    return;
  }

  document.getElementById("createModal").style.display = "flex";
}

function closeModal() {
  document.getElementById("createModal").style.display = "none";
}

async function submitCampaign() {
  // TODO: benerin pesannya
  if (!window.signer) {
    alert("harus connect metamask terlebih dahulu");
    return;
  }

  const title = document.getElementById("title").value;
  const description = document.getElementById("description").value;
  const target = document.getElementById("target").value;
  const deadline = document.getElementById("deadline").value;

  if (!title) {
    alert("Title tidak boleh kosong");
    return;
  }

  if (!description) {
    alert("Deskripsi tidak boleh kosong");
    return;
  }

  const targetRegex = /^\d+(\.\d{0,18})?$/;
  if (!targetRegex.test(target)) {
    alert("Target amount harus berupa angka (maksimal 18 angka desimal).");
    return;
  }

  if (parseFloat(target) <= 0 || isNaN(parseFloat(target))) {
    alert("Target amount harus lebih dari 0.");
    return;
  }

  if (!deadline) {
    alert("Deadline tidak boleh kosong");
    return;
  }

  const selectedDate = new Date(deadline);
  selectedDate.setHours(23, 59, 59);
  const deadlineTimestamp = selectedDate.getTime();
  const now = Date.now();

  if (isNaN(deadlineTimestamp) || deadlineTimestamp <= now) {
    alert("Deadline harus berupa waktu yang valid di masa depan.");
    return false;
  }

  const factory = new ethers.Contract(factoryAddress, factoryABI, window.signer);
  const tx = await factory.createCampaign(title, description, ethers.parseEther(target), deadlineTimestamp);
  await tx.wait();

  document.getElementById("title").value = "";
  document.getElementById("description").value = "";
  document.getElementById("target").value = "";
  document.getElementById("deadline").value = "";

  alert("Campaign created!");
  closeModal();
  await getAllCampaigns();
}

window.onclick = function (e) {
  const modal = document.getElementById("createModal");
  if (e.target === modal) closeModal();
};

async function disconnectWallet() {
  window.signer = null;
  document.getElementById("walletAddress").innerText = "";
  document.getElementById("donationToken").innerText = "";
  document.getElementById("buttonConnect").style.display = "inline-block";
  document.getElementById("buttonDisconnect").style.display = "none";

  document.getElementById("buttonCreateCampaign").style.display = "none";
  document.getElementById("buttonHistory").style.display = "none";
  document.getElementById("buttonMyCampaigns").style.display = "none";

  await getAllCampaigns();
}
