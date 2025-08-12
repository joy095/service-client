<script>
	import SecureImage from '$lib/components/SecureImage.svelte';
	import Calendar from '$lib/components/ui/calendar/calendar.svelte';
	import { getLocalTimeZone, today } from '@internationalized/date';

	let value = today(getLocalTimeZone());
</script>

<svelte:head>
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />
	<title>Barber Booking Checkout</title>
</svelte:head>

<div class="page-wrapper container">
	<!-- Service Details -->
	<div class="service-card">
		<SecureImage
			src="https://img.freepik.com/free-photo/young-man-barbershop-trimming-hair_1303-26254.jpg?t=st=1754919823~exp=1754923423~hmac=5fdbc2c5947a451f44b0f3acaa0542594d4d96e64437a142abc63d5827a82dee&w=1060"
			alt="Haircut Service"
			height={400}
			className="w-full h-[18rem] object-cover"
		/>
		<div class="service-content">
			<div class="service-title">Premium Men's Haircut</div>
			<div class="service-meta">
				<span>⏱ 45 mins</span>
				<span>💰 $30</span>
			</div>
			<div class="price">$30.00</div>
			<p>
				Experience a luxury grooming session with precision styling, shampoo, and a relaxing finish.
			</p>

			<div class="calendar">
				<!-- Date Picker -->
				<!-- <div class="dates">
					<h3>Select Date</h3>
					<div class="date-grid">
						<button>12</button>
						<button class="selected">13</button>
						<button>14</button>
						<button>15</button>
						<button>16</button>
						<button>17</button>
						<button>18</button>
					</div>
				</div> -->

				<div class="dates">
					<h3 class="mb-3 text-xl font-bold">Select Date</h3>
					<Calendar
						type="single"
						bind:value
						class="rounded-md border shadow-sm"
						captionLayout="dropdown"
					/>
				</div>

				<!-- Time Picker -->
				<div class="time-slots">
					<h3 class="mb-3 text-xl font-bold">Select Time</h3>
					<button>09:00 AM</button>
					<button>10:30 AM</button>
					<button class="selected">12:00 PM</button>
					<button>02:00 PM</button>
					<button>04:00 PM</button>
				</div>
			</div>
		</div>
	</div>

	<!-- Sidebar -->
	<div class="sidebar">
		<div class="barber-card">
			<SecureImage
				src="https://images.unsplash.com/photo-1607746882042-944635dfe10e"
				alt="Barber"
				height={180}
				width={220}
				className="h-[6rem] w-[6rem] rounded-full object-cover mb-3"
			/>
			<div class="barber-name">Jeremy Philips</div>
			<div class="rating">⭐⭐⭐⭐⭐</div>
			<p>Specialist in modern styles and classic cuts with 10+ years experience.</p>
		</div>
		<button class="confirm-btn">Confirm Booking</button>
	</div>
</div>

<style>
	.page-wrapper {
		display: grid;
		grid-template-columns: 2fr 1fr;
		gap: 40px;
	}
	.service-card {
		background: white;
		border-radius: 16px;
		overflow: hidden;
		box-shadow: 0 10px 25px rgba(0, 0, 0, 0.06);
	}
	.service-content {
		padding: 20px;
	}
	.service-title {
		font-size: 26px;
		font-weight: bold;
		margin-bottom: 10px;
	}
	.service-meta {
		display: flex;
		gap: 20px;
		margin-bottom: 15px;
		font-size: 14px;
		color: #777;
	}
	.service-meta span {
		display: flex;
		align-items: center;
		gap: 6px;
	}
	.price {
		font-size: 20px;
		color: #008060;
		font-weight: bold;
		margin-bottom: 20px;
	}
	.calendar {
		display: flex;
		gap: 20px;
		align-items: flex-start;
	}
	.dates {
		background: #f5f8fa;
		padding: 15px;
		border-radius: 12px;
	}
	.dates h3 {
		margin-top: 0;
	}
	.date-grid {
		display: grid;
		grid-template-columns: repeat(7, 40px);
		gap: 8px;
		margin-top: 10px;
	}
	.date-grid button {
		background: #fff;
		border: 1px solid #ddd;
		border-radius: 8px;
		padding: 5px;
		cursor: pointer;
		transition: 0.2s;
	}
	.date-grid button:hover,
	.date-grid button.selected {
		background: #008060;
		color: white;
		border-color: #008060;
	}
	.time-slots {
		background: #f5f8fa;
		padding: 15px;
		border-radius: 12px;
	}
	.time-slots h3 {
		margin-top: 0;
	}
	.time-slots button {
		width: 100%;
		padding: 10px;
		margin-bottom: 8px;
		border: none;
		background: white;
		border-radius: 8px;
		border: 1px solid #ddd;
		cursor: pointer;
		transition: 0.2s;
	}
	.time-slots button:hover,
	.time-slots button.selected {
		background: #008060;
		color: white;
		border-color: #008060;
	}
	.sidebar {
		display: flex;
		flex-direction: column;
		gap: 20px;
	}
	.barber-card {
		background: white;
		border-radius: 16px;
		padding: 20px;
		box-shadow: 0 10px 25px rgba(0, 0, 0, 0.06);
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.barber-name {
		font-weight: bold;
		font-size: 18px;
	}
	.rating {
		color: gold;
		margin: 6px 0;
	}
	.confirm-btn {
		padding: 15px;
		background: #008060;
		color: white;
		font-size: 16px;
		font-weight: bold;
		border-radius: 12px;
		border: none;
		cursor: pointer;
		transition: 0.2s;
	}
	.confirm-btn:hover {
		background: #006a50;
	}
</style>
