function formatTimestamp(timestamp) {
  const date = new Date(Number(timestamp));
  return date.toLocaleString("id-ID");
}

function validateTarget(input) {
  // only allowed number and symbol (.)
  // require one number before use symbol (.)
  // max 18 digits after symbol (.)
  const regex = /^\d+(\.\d{0,18})?$/;

  if (!regex.test(input.value)) {
    input.value = input.value.slice(0, -1);
  }
}

function renderEmptyMessage(container, msg) {
  const emptyMsg = document.createElement("div");
  emptyMsg.textContent = msg;
  emptyMsg.style.cssText = "font-style: italic; text-align: center; color: #777";
  container.appendChild(emptyMsg);
}

async function handleDonate(address) {
  if (!window.signer) {
    // TODO: benerin pesannya
    alert("login dulu bang");
    return;
  }

  try {
    // TODO: benerin pesannya
    const amount = prompt("Mau donasi berapa bang? (ETH)");
    if (amount == null) return;

    // TODO: benerin pesannya
    if (!amount || isNaN(amount)) {
      alert("bukan angka ini boskuh");
      return;
    }

    const campaign = new ethers.Contract(address, campaignABI, window.signer);
    const tx = await campaign.donate({ value: ethers.parseEther(amount) });
    await tx.wait();

    await updateDonationToken();
    alert("Thank you for donating!");
    getAllCampaigns();
  } catch (err) {
    console.error("Donation failed:", err);
    alert("Donation cancelled or failed.");
  }
}

async function handleAccept(address, currentTokens) {
  if (!window.signer) {
    // TODO: benerin pesannya
    alert("login dulu bang");
    return;
  }

  try {
    // TODO: benerin pesannya
    const input = prompt("Mau accept berapa bang? (ETH)");
    if (input == null) return;

    const amount = parseInt(input);
    // TODO: benerin pesannya
    if (isNaN(amount)) {
      alert("bukan angka ini boskuh");
      return;
    }

    // TODO: benerin pesannya
    if (amount + Number(currentTokens) > 10) {
      alert("kelebihan abangkuh");
      return;
    }

    const approverTokens = await window.factory.getApproverToken(window.signer.address);
    if (amount > Number(approverTokens)) {
      alert("Approver token anda kurang");
      return;
    }

    const factory = new ethers.Contract(factoryAddress, factoryABI, window.signer);
    const tx = await factory.acceptCampaign(address, amount);
    await tx.wait();

    await updateDonationToken();
    alert("Thank you for accepting!");
    getAllCampaigns();
  } catch (err) {
    console.error("Accept failed:", err);
    alert("Accept cancelled or failed.");
  }
}

async function handleWithdraw(address) {
  if (!window.signer) {
    // TODO: benerin pesannya
    alert("login dulu bang");
    return;
  }

  try {
    const campaign = new ethers.Contract(address, campaignABI, window.signer);

    if (!(await campaign.withdrawable())) {
      alert("belum bisa withdraw bang");
      return;
    }

    const tx = await campaign.withdraw();
    await tx.wait();

    alert("Withdrawal successful");
    getAllCampaigns();
  } catch (err) {
    console.error("Accept failed:", err);
    alert("Accept cancelled or failed.");
  }
}

async function updateDonationToken() {
  if (!window.signer) {
    // TODO: benerin pesannya
    alert("login dulu bang");
    return;
  }

  const tokenAmount = await window.factory.getApproverToken(window.signer.address);
  document.getElementById("donationToken").innerText = "Donation Token: " + tokenAmount;
}
