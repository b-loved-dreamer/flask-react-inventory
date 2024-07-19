up:
	docker-compose -p gatech -f docker-compose.yml up --build -d

clean:
	docker-compose -p gatech -f docker-compose.yml down