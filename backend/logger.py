import osu_irc
import os
import mysql.connector
from dotenv import load_dotenv

load_dotenv()

class ListenBot(osu_irc.Client):
    async def onReady(self):
        await self.joinChannel("#osu")
        print("Connection made, listening for messages.")

    async def onMessage(self, message):
        if message.is_private:
            return

        if message.is_action:
            return

        connection = mysql.connector.connect(
            host=os.getenv('DATABASE_HOST'),
            user=os.getenv('DATABASE_USER'),
            password=os.getenv('DATABASE_PASS'),
            database="osu")

        cursor = connection.cursor(prepared=True)

        sql_insert_query = """ INSERT INTO chat
            (bancho_id, username, message, channel) VALUES (%s,%s,%s,%s)"""

        cursor.execute(sql_insert_query, (1, message.user_name, message.content, message.room_name))
        connection.commit()

        cursor.close()
        connection.close()

        print('Insert made')

print((os.getenv('LEGACY_IRC_USERNAME'), os.getenv('LEGACY_IRC_PASSWORD')))

x = ListenBot(
    token = os.getenv('LEGACY_IRC_PASSWORD'),
    nickname = os.getenv('LEGACY_IRC_USERNAME')
)

x.run()
